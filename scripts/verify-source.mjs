import { readFile, access } from 'node:fs/promises';
import { load } from 'cheerio';
const pages = JSON.parse(await readFile('src/content/pages.json', 'utf8'));
const missingAssets = new Set(), missingPages = new Set();
let scripts = 0, remoteImages = 0;
for (const page of Object.values(pages)) {
  const $ = load(page.html);
  scripts += $('script, iframe, [onclick], [onerror]').length;
  for (const img of $('img').toArray()) {
    const src = $(img).attr('src');
    if (/^https?:/.test(src)) remoteImages++;
    if (src?.startsWith('/')) { try { await access('public' + src); } catch { missingAssets.add(src); } }
  }
  for (const a of $('a[href]').toArray()) {
    const href = $(a).attr('href').split('#')[0];
    if (href.startsWith('/') && !pages[href] && !href.startsWith('/cdn-cgi/')) {
      try { await access('public' + href); } catch { missingPages.add(href); }
    }
  }
}
console.log(JSON.stringify({ pages: Object.keys(pages).length, missingAssets: [...missingAssets], missingPages: [...missingPages], scripts, remoteImages }, null, 2));
if (missingAssets.size || scripts || remoteImages) process.exitCode = 1;
