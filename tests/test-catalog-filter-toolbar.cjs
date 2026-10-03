require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/Failed to resolve component.*catalog-filter/.test(m.text()))errors.push(m.text())});
  for(const file of ['index.html','masal.html']){
   await page.goto(pathToFileURL(path.resolve(file)).href);
   if(await page.locator('#login-name').isVisible()){
    await page.locator('#login-name').fill('admin');await page.locator('#login-password').fill('123456789');
    await page.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();
   }
   await page.waitForFunction(()=>window.app&&!app.loginScreen);
   for(const section of ['products','providers','inventory','prices']){
    await page.evaluate(s=>app.go(s),section);
    const bar=page.locator('.catalog-filter');await bar.waitFor();
    const toggle=bar.getByRole('button',{name:'فلترة وبحث',exact:false});
    await toggle.click();await bar.locator('form').waitFor();
    assert.equal(await page.locator('.overlay:visible').count(),0,`${section}: no modal`);
    await bar.getByRole('button',{name:'تطبيق الفلتر',exact:true}).click();
    if(['inventory','prices'].includes(section))await bar.locator('.table-pagination-inline').waitFor();
    if(['products','providers'].includes(section)){
     await bar.locator('.table-pagination-inline').waitFor();
     assert.match(await bar.locator('.workspace-more>summary').innerText(),/تصدير/);
    }
    for(const width of [1280,1366])for(const theme of ['light','dark']){
     await page.setViewportSize({width,height:900});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
     const layout=await bar.locator('.catalog-filter-head').evaluate(el=>{
      const boxes=[...el.querySelectorAll('button,summary,.table-pagination-inline select,.table-pagination-inline>span')].filter(b=>b.checkVisibility()&&!b.closest('.category-column-options')).map(b=>b.getBoundingClientRect());
      return{centers:boxes.map(b=>b.y+b.height/2),fits:el.scrollWidth<=el.clientWidth+2};
     });
     if(Math.max(...layout.centers)-Math.min(...layout.centers)>=3)await bar.screenshot({path:'tmp/review/catalog-layout-failure.png'});
     assert.ok(Math.max(...layout.centers)-Math.min(...layout.centers)<3,`${file} ${section} ${width} ${theme}: aligned ${JSON.stringify(layout)}`);
     assert.ok(layout.fits,`${file} ${section} ${width} ${theme}: fits`);
    }
    if(file==='masal.html')await bar.screenshot({path:`tmp/review/catalog-${section}.png`});
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS inline filters render and open on all four pages; toolbar controls fit one row at 1280/1366 in both themes and both entry files.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
