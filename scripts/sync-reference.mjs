import { load } from 'cheerio';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const origin = 'https://hitclub.istanbul';
const assets = new Map();
const failures = [];
async function download(url, path) {
  await mkdir(dirname(path), { recursive: true });
  await run('curl.exe', ['-f', '-sS', '-L', '--retry', '2', '--max-time', '45', url, '-o', path]);
}
function asset(raw, base = origin + '/') {
  if (!raw || /^(data:|#)/.test(raw)) return raw;
  const url = new URL(raw, base);
  const path = url.hostname === 'hitclub.istanbul' ? url.pathname : '/fonts/' + url.pathname.split('/').pop();
  assets.set(path, url.href);
  return path;
}
function cssAssets(css, base) {
  return css.replace(/url\((['"]?)(.*?)\1\)/g, (full, quote, raw) => raw.startsWith('data:') ? full : `url("${asset(raw, base)}")`);
}
await mkdir('src/content', { recursive: true });
await mkdir('public/build', { recursive: true });
await download(origin + '/', 'reference.html');
await download(origin + '/build/style.min.css?v=27.1.30', 'reference.css');
const home = await readFile('reference.html', 'utf8');
const root = load(home);
const routes = new Set(['/']);
root('a[href]').each((_, el) => {
  const u = new URL(root(el).attr('href'), origin);
  if (u.origin === origin && !u.pathname.startsWith('/cdn-cgi/')) routes.add(u.pathname);
});
const pages = {};
for (const route of routes) {
  try {
    let html = home;
    if (route !== '/') {
      const cache = '.reference/' + route.replaceAll('/', '_') + '.html';
      await download(origin + route, cache);
      html = await readFile(cache, 'utf8');
    }
    const $ = load(html);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || title;
    $('script, noscript, iframe, input[type="hidden"]').remove();
    $('*').each((_, el) => {
      for (const key of Object.keys(el.attribs || {})) {
        if (/^on/i.test(key)) {
          if (key === 'onclick') $(el).attr('data-action', el.attribs[key]);
          $(el).removeAttr(key);
        }
      }
      if ($(el).attr('style')) $(el).attr('style', cssAssets($(el).attr('style'), origin + '/'));
    });
    $('[src]').each((_, el) => $(el).attr('src', asset($(el).attr('src'))));
    $('[srcset]').removeAttr('srcset');
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (/^javascript:/i.test(href)) { $(el).removeAttr('href'); return; }
      const u = new URL(href, origin);
      if (u.origin === origin) {
        $(el).attr('href', u.pathname + u.hash);
        if (!u.pathname.startsWith('/cdn-cgi/') && !/\.(png|webp|jpg|svg|gif|pdf|zip)$/i.test(u.pathname) && routes.size < 100) routes.add(u.pathname);
      }
      if ($(el).attr('target') === '_blank') $(el).attr('rel', 'noopener noreferrer');
    });
    $('form').attr('action', '#').removeAttr('method');
    $('input').each((_, el) => { const ph = $(el).attr('placeholder'); if (ph) $(el).attr('aria-label', ph); });
    $('.recaptcha-bg').removeAttr('style').text('HIT826').attr('aria-label', 'Mã xác nhận demo HIT826');
    $('.capcha_icon').attr('role', 'button').attr('tabindex', '0').attr('aria-label', 'Đổi mã xác nhận');
    $('.icon-prepend').attr('role', 'button').attr('tabindex', '0').attr('aria-label', 'Hiện hoặc ẩn mật khẩu');
    $('.btnsubmit img').attr('alt', 'Đăng ký ngay');
    $('.logo img').attr('alt', 'HIT CLUB');
    $('.__cf_email__').text('info@hit.club').removeAttr('data-cfemail').parent('a').attr('href', 'mailto:info@hit.club');
    pages[route] = { title, description, html: $('body').html() };
    console.log('Page:', route);
  } catch (error) { failures.push({ route, error: error.message }); }
}
const css = cssAssets(await readFile('reference.css', 'utf8'), origin + '/build/style.min.css');
await writeFile('public/build/reference.css', css);
await download('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap', '.reference/fonts.css');
await writeFile('public/build/fonts.css', cssAssets(await readFile('.reference/fonts.css', 'utf8'), 'https://fonts.googleapis.com/'));
asset('/apple-icon.png');
// Captcha is generated locally by the React layer, never fetched from the original service.
assets.delete('/get-captcha.html');
let cursor = 0;
const entries = [...assets];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < entries.length) {
    const [path, url] = entries[cursor++];
    try { await download(url, join('public', path)); }
    catch (error) { failures.push({ asset: path, error: error.message }); }
  }
}));
await writeFile('src/content/pages.json', JSON.stringify(pages, null, 2));
const manifest = [];
for (const [path, source] of entries) {
  try { manifest.push({ path, source, bytes: (await stat(join('public', path))).size }); } catch {}
}
await writeFile('src/content/assets-manifest.json', JSON.stringify(manifest, null, 2));
await writeFile('src/content/sync-report.json', JSON.stringify({ pages: Object.keys(pages), assets: manifest.length, failures }, null, 2));
console.log(JSON.stringify({ pages: Object.keys(pages).length, assets: manifest.length, failures }, null, 2));
