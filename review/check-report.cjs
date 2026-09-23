const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('file:///'+path.resolve('review/masal-review.html').replaceAll('\\','/'));
const total=await p.locator('.requirement').count();assert.equal(total,require('./requirements-audit.json').length);
await p.locator('#state').selectOption('جزئي');assert.equal(await p.locator('.requirement:visible').count(),require('./requirements-audit.json').filter(r=>r.status==='جزئي').length);
await p.locator('#reset').click();await p.locator('#search').fill('Top-up');assert.ok(await p.locator('.requirement:visible').count()>0);
await p.locator('#reset').click();await p.locator('.requirement details').first().locator('summary').click();await p.locator('.source-ref').first().click();assert.equal(await p.locator('#sourceDetails').getAttribute('open'),'');
await p.locator('#sourceDetails').evaluate(x=>x.open=false);await p.evaluate(()=>window.scrollTo(0,0));
for(const [width,height] of [[1440,1000],[390,844]]){await p.setViewportSize({width,height});await p.screenshot({path:`review/report-${width}.png`});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`overflow ${width}`)}
assert.deepEqual(errors,[]);console.log(`PASS report ${total} items, filters, source links, desktop/mobile no overflow`);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
