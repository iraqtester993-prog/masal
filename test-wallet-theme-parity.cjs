const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);
  await page.locator('#login-name').fill('admin');
  await page.locator('#login-password').fill('123456789');
  await page.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();
  await page.waitForFunction(()=>!app.loginScreen);
  await page.evaluate(()=>app.go('reports'));
  const gradients={};
  for(const theme of ['light','dark']){
   await page.evaluate(t=>{document.documentElement.dataset.theme=t;app.reportOpenGroup=''},theme);
   const card=page.locator('.report-group-card.report-group-wallets');
   await card.waitFor();
   await page.waitForTimeout(450);
   const style=await card.evaluate(e=>{
    const s=getComputedStyle(e);
    const accent=s.getPropertyValue('--report-accent');
    const probe=document.createElement('div');
    probe.style.backgroundImage=document.documentElement.dataset.theme==='light'
     ?'linear-gradient(130deg,color-mix(in srgb,'+accent+' 12%,'+s.getPropertyValue('--panel')+'),'+s.getPropertyValue('--panel')+')'
     :'linear-gradient(130deg,color-mix(in srgb,'+accent+' 22%,#192437),#192437)';
    document.body.append(probe);const expected=getComputedStyle(probe).backgroundImage;probe.remove();
    return {actual:s.backgroundImage,expected};
   });
   assert.equal(style.actual,style.expected,'Wallet must use the standard report card gradient formula');
   gradients[theme]=style.actual;
   await page.screenshot({path:'tmp/wallet-groups-'+theme+'.png',animations:'disabled'});
   await page.evaluate(()=>app.toggleReportGroup('wallets'));
   const tiles=page.locator('.report-related.report-group-wallets .report-tile');
   assert.ok(await tiles.count()>0);
   assert.ok((await tiles.evaluateAll(ns=>ns.map(n=>getComputedStyle(n).backgroundImage))).every(bg=>bg===style.actual));
   await page.waitForTimeout(450);
   await page.screenshot({path:'tmp/wallet-children-'+theme+'.png',animations:'disabled'});
  }
  assert.notEqual(gradients.light,gradients.dark,'Daytime must not retain the dark background');
  assert.deepEqual(errors,[]);
  console.log('PASS standard report palette, theme-aware wallet background and matching child gradients');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
