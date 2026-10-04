require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.MASAL_TEST_URL||'http://127.0.0.1:4173/');await page.waitForFunction(()=>window.app);
  await page.evaluate(async()=>{
   const check=(v,m)=>{if(!v)throw Error(m)},deny=fn=>{try{fn()}catch{return true}return false};
   const s=Masal.seed();for(const [key,value]of Object.entries(app.s))if(key.endsWith('Revision'))s[key]=value;MasalOperations.initialize(s);s.cards=[];s.batches=[];s.serviceLedger=[];s.batchInvoices=[];
   app.s=s;app.currentUser='U1';app.loginScreen=false;
   const owner=app.engine,main=new Masal.Engine(s,'U3'),sub=new Masal.Engine(s,'U4'),point=new Masal.Engine(s,'U5');
   owner.proposePrices([{agent:'A1',product:'C1',price:4800}]);
   owner.approveCashOrder({agent:'A1',product:'C1',cost:4400,expenses:0,supplier:'Vue test',city:'بغداد',loadPrice:4800,postingKey:'vue-transactions',cashConfirmed:true},Array.from({length:10},(_,i)=>({pin:'VUE-PIN-'+i,serial:'VUE-SERIAL-'+i,expiry:'2099-12-31'})));
   owner.saveFundingRequestPolicy({amounts:[10000],dailyLimit:2});
   main.directWalletFunding('A3',20000,'voucher','vue-funding');
   const source=point.walletParent(),payer=source==='A1'?main:sub;
   const r=point.requestWalletFunding(10000,'voucher','Vue request','vue-request'),beforeFrom=payer.serviceBalance(source),beforeTo=point.serviceBalance(point.actor().pos);
   check(deny(()=>point.reviewWalletFunding(r.id,'approve')),'Point cannot approve own funding');
   payer.reviewWalletFunding(r.id,'approve');payer.reviewWalletFunding(r.id,'approve');
   check(payer.serviceBalance(source)===beforeFrom-10000&&point.serviceBalance(point.actor().pos)===beforeTo+10000,'Funding balances and retries');
   const beforeSale=point.serviceBalance(point.actor().pos),sale=point.sell(point.actor().pos,'C1',1,'vue-sale');
   check(point.sell(point.actor().pos,'C1',1,'vue-sale').id===sale.id,'Sale retry idempotency');
   point.beginPrint(sale.id);point.printResult(sale.id,false,'انتهاء الورق');const reprint=point.requestReprint(sale.id,'إعادة طباعة تجريبية');
   check(deny(()=>point.beginPrint(sale.id)),'Reprint needs approval');payer.approveReprint(reprint.id,true);await new Promise(r=>setTimeout(r,5200));point.beginPrint(sale.id);point.printResult(sale.id,true);
   check(sale.status==='Reprinted'&&point.serviceBalance(point.actor().pos)===beforeSale-sale.credit,'Print/reprint keeps one debit');
   check(deny(()=>point.sell('POS3','C1',1,'outside-scope')),'Foreign POS blocked');
   app.go('wallets');await Vue.nextTick();app.persist();
   window.vueSaleId=sale.id;
  });
  const id=await page.evaluate(()=>vueSaleId);await page.reload();await page.waitForFunction(()=>window.app);
  assert.equal(await page.evaluate(id=>app.s.sales.find(r=>r.id===id)?.status,id),'Reprinted');assert.deepEqual(errors,[]);
  console.log('PASS Vue funding approvals, role guards, balanced transfers, sale retries, printing/reprinting, scope and saved transactions');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
