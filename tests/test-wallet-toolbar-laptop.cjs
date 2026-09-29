require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(require('node:url').pathToFileURL(require('node:path').resolve('masal.html')).href);
 await p.locator('#login-name').fill('admin');await p.locator('#login-password').fill('123456789');await p.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await p.waitForFunction(()=>!app.loginScreen);await p.evaluate(()=>app.go('wallets'));
 for(const width of [1280,1366,1440,1536])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:900});await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const result=await p.locator('.wallet-filter-toolbar').evaluate(e=>{const buttons=[...e.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width);const boxes=buttons.map(b=>b.getBoundingClientRect());return {centers:boxes.map(b=>b.y+b.height/2),heights:boxes.map(b=>b.height),fits:e.scrollWidth<=e.clientWidth+2}});
  assert.ok(Math.max(...result.centers)-Math.min(...result.centers)<3,`${width} ${theme}: one row`);assert.ok(result.fits,`${width} ${theme}: all controls fit`);
  if(width===1366)await p.locator('.wallet-filter-toolbar').screenshot({path:`tmp/wallet-toolbar-laptop-${theme}.png`});
 }
 await p.locator('.wallet-service-cards button').filter({hasText:'Top-up'}).click();assert.equal(await p.evaluate(()=>app.$refs.operations.service),'topup');assert.deepEqual(errors,[]);console.log('PASS laptop toolbar one row and fully visible at 1280/1366/1440/1536, light/dark, working selection');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
