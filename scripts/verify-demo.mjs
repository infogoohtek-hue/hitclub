import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const api = await readFile('src/app/api/submit/route.ts', 'utf8');
const ui = await readFile('src/components/ReferencePage.tsx', 'utf8');
const demo = await readFile('src/components/DemoLobby.tsx', 'utf8');
assert.match(api, /status: 410/);
assert.doesNotMatch(api, /req\.|request\.|fetch\(|console\.|writeFile|GOOGLE|TELEGRAM/);
assert.doesNotMatch(ui + demo, /fetch\(|sendBeacon|localStorage|sessionStorage|NEXT_PUBLIC_REDIRECT_URL/);
assert.match(demo, /readOnly/);
const base = process.argv[2];
if (base) {
  const response = await fetch(base + '/api/submit', { method: 'POST', body: JSON.stringify({ probe: 'demo-disabled-check' }), headers: { 'Content-Type': 'application/json' } });
  assert.equal(response.status, 410);
  const home = await (await fetch(base)).text();
  for (const field of ['username', 'password']) {
    const tag = home.match(new RegExp('<input[^>]*name="' + field + '"[^>]*>'))?.[0];
    assert.ok(tag && /disabled/.test(tag), field + ' must be disabled in server HTML');
  }
  for (const path of ['/demo', '/demo/login']) {
    const res = await fetch(base + path);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /AURORA/);
  }
}
console.log('PASS: collection disabled, demo contains no transmission/storage code' + (base ? ', HTTP checks passed' : ''));
