const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await page.waitForFunction(()=>typeof app.go==='function');
 await page.evaluate(()=>{app.currentUser=app.s.users.find(u=>u.role==='owner').id;app.loginScreen=false;app.go('reports');app.openReportDetails('operations')});
 for(const width of [1440,1280])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:1000});await page.evaluate(theme=>{app.theme=theme;document.documentElement.dataset.theme=theme},theme);
  const boxes=await page.locator('.report-table-tools').evaluate(el=>[...el.children].map(x=>{const r=x.getBoundingClientRect();return {y:r.y+r.height/2,left:r.left,right:r.right}}));
  assert.ok(Math.max(...boxes.map(b=>b.y))-Math.min(...boxes.map(b=>b.y))<2,`${width} ${theme}: single row`);
  assert.ok(boxes.every(b=>b.left>=0&&b.right<=width));
 }
 await page.locator('.report-table-tools summary').click();assert.ok(await page.locator('.report-table-tools .column-picker>div').isVisible());await page.locator('.report-table-tools summary').click();
 await page.locator('.report-show-record').first().click();
 await page.locator('.report-table-tools').scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/previews/report-toolbar-dark.png',animations:'disabled'});
 assert.deepEqual(errors,[]);console.log('PASS report toolbar single row at 1280/1440, light/dark, columns menu and details');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
