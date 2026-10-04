require('./setup.cjs');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const pages=[],errors=[];
  for(const url of [pathToFileURL(path.resolve('masal.html')).href,process.env.MASAL_TEST_URL||'http://127.0.0.1:4173/']){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(url+': '+e.message));
   await page.goto(url);await page.waitForFunction(()=>window.app);await page.locator('#login-name').fill('admin');await page.locator('#login-password').fill('123456789');await page.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await page.waitForFunction(()=>!app.loginScreen);pages.push(page);
  }
  const contract=p=>p.evaluate(()=>({methods:Object.keys(MasalAppOptions.methods).sort(),components:Object.keys(MasalAppOptions.components).sort(),computed:Object.keys(MasalAppOptions.computed).sort(),operations:Object.getOwnPropertyNames(Masal.Engine.prototype).sort()}));
  assert.deepEqual(await contract(pages[1]),await contract(pages[0]),'All operations, methods and components retained');
  const seed=await pages[0].evaluate(()=>Masal.clone(app.s));await pages[1].evaluate(async s=>{app.s=s;await Vue.nextTick()},seed);
  const routes=await pages[0].evaluate(()=>NAV.flatMap(g=>g.items.map(n=>n[0])));
  let checked=0;
  for(const route of routes){
   const snapshots=[];
   for(const page of pages){
    await page.evaluate(async r=>{app.go(r);await Vue.nextTick()},route);
    snapshots.push(await page.evaluate(()=>({page:app.page,fields:[...document.querySelectorAll('main input,main select,main textarea')].map(e=>({tag:e.tagName,type:e.type,required:e.required,placeholder:e.getAttribute('placeholder'),label:e.getAttribute('aria-label'),options:e.tagName==='SELECT'?[...e.options].map(o=>o.textContent.trim()):undefined})),buttons:[...document.querySelectorAll('main button')].map(e=>e.textContent.trim()),layout:['.sidebar','.topbar','.main'].map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return r?[Math.round(r.width),Math.round(r.height)]:null})})));
   }
   assert.deepEqual(snapshots[1],snapshots[0],'Page contract/layout: '+route);checked++;
  }
  for(const page of pages){await page.evaluate(async()=>{app.lang='en';app.setLanguage();app.go('wallets');await Vue.nextTick()})}
  assert.equal(await pages[1].locator('main').innerText(),await pages[0].locator('main').innerText(),'English translation retained');
  await pages[1].evaluate(()=>app.go('exports'));await pages[1].reload();await pages[1].waitForFunction(()=>window.app&&!app.loginScreen);assert.equal(await pages[1].evaluate(()=>app.page),'exports','Hash route survives refresh');
  assert.deepEqual(errors,[]);console.log('PASS Vue production parity: '+checked+' pages, all operations/components, fields, buttons, layout, translation and hash reload');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
