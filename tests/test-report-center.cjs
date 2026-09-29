require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);
 await page.waitForFunction(()=>typeof app.go==='function');
 const result=await page.evaluate(()=>{
  app.currentUser=app.s.users.find(u=>u.role==='owner').id;app.loginScreen=false;app.go('reports');app.resetReport();
  const s=app.s,time=new Date().toISOString(),agent=s.agents.find(a=>a.type==='رئيسي'),product=s.products[0],owner=app.currentUser;
  s.pendingOrders.push({id:'TEST-ORDER',agent:agent.id,time,user:owner,status:'معتمدة',quantity:2,meta:{product:product.id,supplier:'مجهز الاختبار',loadPrice:4000},rows:[{pin:'SECRET-PIN',cvc:'SECRET-CVC'}],batch:s.batches[0].id});
  s.priceRequests.push({id:'TEST-PRICE',time,creator:owner,approver:owner,status:'معتمد',changes:[{agent:agent.id,product:product.id,old:4000,price:4500}]});
  s.fundingRequests.push({id:'TEST-FUND',time,from:'@owner',to:agent.id,user:owner,amount:100,service:'cash',status:'منفذ',approvedAmount:100,transfer:'TEST-TRANSFER'});
  s.fundingTransfers.push({id:'TEST-TRANSFER',time,from:'@owner',to:agent.id,user:owner,amount:100,service:'cash',status:'منفذ'});
  s.audit.push({id:'TEST-AUDIT',time,user:owner,name:'المدير',action:'تعديل حساب',entity:agent.id,before:{name:'القديم',password:'SECRET-PASSWORD'},after:{name:'الجديد',credentials:{hash:'SECRET-HASH'},pin:'SECRET-PIN'}});
  const bundle=app.reportBundle;if(bundle.error)throw Error(bundle.error);
  return {ids:bundle.sections.map(s=>s.id),notifications:bundle.sections.find(s=>s.id==='operations-notifications').rows.length,stored:s.notifications.length,order:bundle.sections.find(s=>s.id==='inventory-orders').rows[0],changes:bundle.sections.find(s=>s.id==='prices-changes').rows,settings:bundle.sections.find(s=>s.id==='operations').rows,serialized:JSON.stringify(bundle)};
 });
 assert.ok(result.ids.length>=45);assert.equal(result.notifications,result.stored);assert.equal(result.order.amount,8000);
 assert.equal(result.changes.find(r=>r.id==='TEST-PRICE').difference,500);
 assert.ok(result.settings.every(r=>!['true','false'].includes(r.value)&&/[\u0600-\u06ff]/.test(r.key)));
 assert.ok(!/SECRET-/.test(result.serialized));
 for(const id of result.ids){
  await page.evaluate(id=>{app.closeModal();app.openReportDetails(id)},id);
  await page.locator('.report-detail-dialog').waitFor();
  if(await page.locator('.report-show-record').count()){
   await page.locator('.report-show-record').first().click();
   await page.locator('.report-record-fields').waitFor();
   assert.ok(!/\[object Object\]|SECRET-/.test(await page.locator('.report-record-panel').innerText()),id);
  }
 }
 await page.evaluate(()=>{app.closeModal();app.openReportDetails('inventory-cards')});
 assert.ok(await page.locator('.report-show-record').count()<=20);
 assert.equal(await page.locator('.report-detail-dialog .table-pagination-tools').count(),0);
 await page.evaluate(()=>{app.toggleReportColumn('serial');app.reportSearch='DEMO'});
 const exported=await page.evaluate(()=>app.reportExportSections(false));
 assert.ok(!exported[0].columns.some(c=>c.key==='serial'));assert.ok(exported[0].rows.length>20);
 await page.evaluate(()=>{app.closeModal();app.openReportDetails('wallets-requests')});
 await page.locator('.report-show-record').first().click();
 assert.ok((await page.locator('.report-linked').innerText()).includes('TEST-TRANSFER'));
 await page.setViewportSize({width:430,height:900});
 assert.ok(await page.locator('.report-record-fields').isVisible());
 await page.screenshot({path:'tmp/output/previews/report-center-details.png',fullPage:true,animations:'disabled'});
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>{app.theme='dark';document.documentElement.dataset.theme='dark'});
 await page.screenshot({path:'tmp/output/previews/report-center-dark.png',fullPage:true,animations:'disabled'});
 const dates=await page.evaluate(()=>{
  const e=app.engine,next='2099-01-01',bundle=MasalReports.build(e,{from:next,to:next});
  return {orders:bundle.sections.find(s=>s.id==='inventory-orders').rows.length,transfers:bundle.sections.find(s=>s.id==='wallets-transfers').rows.length,snapshot:bundle.sections.find(s=>s.id==='inventory-cards').rows.length};
 });
 assert.equal(dates.orders,0);assert.equal(dates.transfers,0);assert.ok(dates.snapshot>0);
 const scopes=await page.evaluate(()=>{
  app.closeModal();const s=app.s,owner=app.currentUser,main=s.users.find(u=>u.role==='main');
  const foreign={id:'TEST-FOREIGN',name:'خارج النطاق',type:'رئيسي',active:true};s.agents.push(foreign);
  s.fundingRequests.push({id:'FOREIGN-FUND',time:new Date().toISOString(),from:'@owner',to:foreign.id,amount:987,status:'بانتظار التمويل'});
  const actor=main||s.users.find(u=>u.role==='sub');
  const e=new Masal.Engine(s,actor.id),bundle=MasalReports.build(e);
  const restricted=JSON.stringify(bundle);
  const limited={...actor,id:'REPORT-LIMITED',permissionProfileId:null,access:{overrides:{'reports.view':'allow','reports.sales':'allow','reports.inventory':'allow','data.cost':'deny','data.profit':'deny'}}};s.users.push(limited);
  const noCosts=MasalReports.build(new Masal.Engine(s,limited.id));
  return {leaks:restricted.includes('FOREIGN-FUND'),admin:bundle.sections.some(x=>['operations-printing','users-times','network-archive'].includes(x.id)),costs:noCosts.sections.flatMap(s=>s.columns).filter(c=>['data.cost','data.profit'].includes(c.permission)).length};
 });
 assert.equal(scopes.leaks,false);assert.equal(scopes.admin,false);assert.equal(scopes.costs,0);assert.deepEqual(errors,[]);
 console.log('PASS '+result.ids.length+' reports: details, modern notices, price differences, safe fields, related records, paging, export, mobile and scoped permissions');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
