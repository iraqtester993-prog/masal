require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await p.waitForFunction(()=>window.app);
 await p.evaluate(async()=>{app.currentUser='U1';app.loginScreen=false;app.go('wallets');await Vue.nextTick()});
 const measure=()=>p.locator('.wallet-filter-toolbar').evaluate(e=>({height:e.getBoundingClientRect().height,buttons:[...e.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {text:b.textContent.trim(),x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontSize,padding:s.padding}})}));
 for(const width of [390,1280,1366,1536])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:900});await p.evaluate(async t=>{document.documentElement.dataset.theme=t;app.$refs.operations.tab='bulk';await Vue.nextTick()},theme);
  await p.waitForTimeout(350);const before=await measure();await p.getByRole('button',{name:'استرجاع الرصيد',exact:true}).click();await p.waitForTimeout(350);
  assert.deepEqual(await measure(),before,`${width} ${theme}: unchanged toolbar geometry`);
  assert.equal(await p.locator('.wallet-filter-toolbar form').count(),0);
  assert.equal(await p.locator('.recovery-page .recovery-policy').count(),1);
  if(width===1366&&theme==='light')await p.screenshot({path:'tmp/recovery-toolbar-parity.png',fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('PASS recovery toolbar matches other tabs at mobile/laptop widths and light/dark themes');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
