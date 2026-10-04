require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await page.waitForFunction(()=>window.app);
 const result=await page.evaluate(async()=>{
  const check=(v,m)=>{if(!v)throw Error(m)},deny=fn=>{try{fn()}catch{return true}return false};
  const s=Masal.seed();MasalOperations.initialize(s);s.cards=[];s.batches=[];s.serviceLedger=[];s.batchInvoices=[];const e=new Masal.Engine(s,'U1');
  e.proposePrices([{agent:'A1',product:'C1',price:4800}]);const b=e.approveCashOrder({agent:'A1',product:'C1',cost:4400,expenses:0,supplier:'مجهز اختبار',city:'بغداد',loadPrice:4800,postingKey:'return-test',cashConfirmed:true},Array.from({length:5},(_,i)=>({pin:'0001234567890'+i,serial:'000SERIAL'+i,expiry:'2099-12-31'})));
  const cards=s.cards.filter(c=>c.batch===b.id),baseline=e.serviceBalance('A1');app.s=s;app.currentUser='U1';app.loginScreen=false;
  const r=e.requestSupplierReturn(b.id,[cards[0].id],'تجربة رفض');check(r.quantity===1&&cards[1].status==='Available','selected only');check(e.serviceBalance('A1')===baseline-4800,'selected debit');check(deny(()=>e.requestSupplierReturn(b.id,[cards[0].id],'مكرر')),'duplicate blocked');e.rejectExport(r.id,'رفض الاختبار');check(cards[0].status==='Available'&&e.serviceBalance('A1')===baseline,'rejection restores state and balance');
  cards[4].status='Printed';cards[4].sale='SALE-TEST';check(deny(()=>e.requestSupplierReturn(b.id,[cards[4].id],'مباع')),'sold blocked');check(deny(()=>e.requestSupplierReturn(b.id,['missing'],'خارج')),'invalid card blocked');check(deny(()=>new Masal.Engine(s,'U5').requestSupplierReturn(b.id,[cards[0].id],'صلاحية')),'scope blocked');
  const staff=new Masal.Engine(s,'U3'),staffRequest=staff.requestSupplierReturn(b.id,[cards[2].id],'طلب الموظف');check(staffRequest.status==='بانتظار الاعتماد','staff awaits approval');check(deny(()=>staff.approveExport(staffRequest.id)),'staff cannot approve own request');e.rejectExport(staffRequest.id,'رفض طلب الموظف');check(cards[2].status==='Available','staff rejection restores stock');
  const pending=e.requestSupplierReturn(b.id,[cards[0].id,cards[1].id],'إرجاع المحدد');check(deny(()=>app.completeSupplierReturn(pending.id)),'approval required');e.approveExport(pending.id);
  const failureState=Masal.clone(s),beforeFailure=JSON.stringify(failureState),setItem=Storage.prototype.setItem;app.s=failureState;Storage.prototype.setItem=function(){throw Error('storage full')};try{check(deny(()=>app.completeSupplierReturn(pending.id)),'storage failure rejects completion');check(JSON.stringify(failureState)===beforeFailure,'storage failure rolls back cards and history')}finally{Storage.prototype.setItem=setItem;app.s=s}
  const savedDownload=download,files=[];download=(name,blob)=>files.push({name,blob});
  app.completeSupplierReturn(pending.id);check(cards[0].status==='Exported'&&cards[1].status==='Exported'&&cards[2].status==='Available','only selected exported');check(e.serviceBalance('A1')===baseline-9600,'one debit');
  const record=s.exports[0];app.downloadSupplierReturn(record);check(e.serviceBalance('A1')===baseline-9600&&s.exports.length===1,'redownload no extra mutation');check(deny(()=>app.completeSupplierReturn(pending.id)),'no duplicate completion');
  const file=files[0];check(file.name.endsWith('.xlsx'),'direct xlsx');const sheets=await MasalImportReader.read(new File([file.blob],file.name));check(sheets[0].rows[1][1]==='00012345678900','pin zero preserved');check(sheets[0].rows.length===3,'only two cards in workbook');download=savedDownload;
  app.go('claims');await Vue.nextTick();app.openInventoryManager(b);await Vue.nextTick();return {batch:b.id};
 });
 assert.equal(await page.locator('.inventory-manager input[type=password]').count(),0);await page.getByRole('button',{name:'إرجاع للمزود',exact:true}).click();
 await page.getByRole('button',{name:'تحديد المتبقي',exact:true}).click();await page.locator('.inventory-manager textarea').fill('إرجاع بقية البطاقات');await page.locator('.inventory-manager .formfoot button').click();
 const file=page.waitForEvent('download');await page.getByRole('button',{name:'تأكيد الإرجاع وتنزيل الملف',exact:true}).click();assert((await file).suggestedFilename().endsWith('.xlsx'));
 await page.evaluate(()=>app.closeModal());await page.getByRole('button',{name:'سجل الإرجاع',exact:true}).click();assert.equal(await page.getByRole('button',{name:'إعادة تنزيل',exact:true}).count(),2);
 assert.equal(await page.locator('a[href="decrypt.html"]').count(),0);assert.deepEqual(errors,[]);console.log('PASS selected returns, balances, rejection, sold/scope guards, approval, direct Excel, zeros, redownload idempotency and simplified UI');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
