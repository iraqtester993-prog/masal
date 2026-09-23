const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.app);await p.evaluate(()=>app.go('wallets'));await p.getByRole('button',{name:'الفواتير والتحصيل',exact:true}).click();
 const debtor=p.getByLabel('المدين',{exact:false}),amount=p.getByLabel('مبلغ التحصيل',{exact:true}),method=p.getByLabel('الطريقة',{exact:false}),reference=p.getByLabel('رقم السند',{exact:true}),submit=p.getByRole('button',{name:'تسجيل تحصيل',exact:true});
 assert.equal(await submit.isDisabled(),true);await debtor.selectOption('A1');await amount.fill('10000');await method.selectOption('QiCard');await reference.fill('TEST-RESET-001');assert.equal(await submit.isEnabled(),true);
 await submit.evaluate(el=>{el.click();el.click()});await p.waitForFunction(()=>app.s.collections.length===1);
 assert.equal(await debtor.inputValue(),'');assert.equal(await amount.inputValue(),'');assert.equal(await method.inputValue(),'');assert.equal(await reference.inputValue(),'');assert.equal(await submit.isDisabled(),true);assert.equal(await p.evaluate(()=>app.s.collections[0].method),'QiCard');
 const check=await p.evaluate(async()=>{
  const ops=app.$refs.operations;
  const first=app.s.collections[0],before=app.s.collections.length;const e=app.engine;const repeated=e.collect(first.account,first.amount,first.method,first.reference,first.key);let conflict=false;try{e.collect(first.account,first.amount+1,first.method,first.reference,first.key)}catch{conflict=true}
  const idempotent=repeated.id===first.id&&app.s.collections.length===before;
  ops.collectionForm={account:'A1',amount:500,method:'مندوب',reference:'KEEP-FAILED'};const key=ops.collectionKey;app.s.settings.app=false;await ops.collect();const kept=ops.collectionForm.reference==='KEEP-FAILED'&&ops.collectionForm.amount===500&&ops.collectionKey===key&&app.s.collections.length===before;app.s.settings.app=true;
  await ops.collect();const second=app.s.collections.length===before+1&&ops.collectionForm.reference===''&&ops.collectionKey!==key;
  return {idempotent,conflict,kept,second};
 });for(const [k,v]of Object.entries(check))assert.equal(v,true,k);assert.deepEqual(errors,[]);console.log('PASS actual rapid double click records once; all fields clear on success; disabled empty submit; QiCard value; retry keeps failed input/key; successful new collection; identical retry and payload conflict');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
