require('./setup.cjs');
const assert=require('node:assert/strict'),storage=require('../src/js/state-storage.js');
let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed};
for(const value of ['',JSON.stringify({name:'ماسال 😀',pin:'00125',note:'\u0000\ud800'}),'ab'.repeat(100000),Array.from({length:350000},()=>String.fromCharCode(random()%300)).join('')])assert.equal(storage.decompress(storage.compress(value)),value);
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await p.waitForFunction(()=>window.app&&typeof app.go==='function');
 const info=await p.evaluate(async()=>{
  const s=Masal.seed();MasalOperations.initialize(s);s.cards=[];s.batches=[];s.serviceLedger=[];s.batchInvoices=[];const e=new Masal.Engine(s,'U1');e.proposePrices([{agent:'A1',product:'C1',price:4800}]);
  const batch=e.approveCashOrder({agent:'A1',product:'C1',cost:4400,expenses:0,supplier:'اختبار طلبية كبيرة',city:'بغداد',loadPrice:4800,postingKey:'storage-large',cashConfirmed:true},Array.from({length:6000},(_,i)=>({pin:'000123456'+String(i).padStart(5,'0'),serial:'LARGE-'+i,expiry:'2099-12-31'})));
  const request=e.requestExport(batch.id,'إرجاع طلبية كبيرة');app.s=s;app.currentUser='U1';app.loginScreen=false;await Vue.nextTick();MasalStateStorage.write(s);
  const encoded=MasalStateStorage.compress(JSON.stringify(s));localStorage.setItem('masal-v1',encoded);const padding='x'.repeat(5*1024*1024-encoded.length-150000);localStorage.setItem('quota-fixture',padding);
  let exceeded=false;try{localStorage.setItem('masal-v1',JSON.stringify(s))}catch(error){exceeded=error.name==='QuotaExceededError'}if(!exceeded)throw Error('fixture did not exceed quota');
  app.go('exports');app.inventoryWorkspaceTab='withdraw';await Vue.nextTick();window.largeReturn=request.id;
  return {batch:batch.id,request:request.id,raw:JSON.stringify(s).length,padding:padding.length};
 });
 console.log(await p.evaluate(()=>({tab:app.inventoryWorkspaceTab,page:app.page,requests:app.s.exportRequests.map(r=>r.status),text:document.querySelector('.compact-withdrawal')?.textContent,toast:app.toast})));const file=p.waitForEvent('download');await p.locator('.compact-withdrawal button.primary').click();console.log(await p.evaluate(()=>({toast:app.toast,stored:localStorage.getItem('masal-v1').length})));assert((await file).suggestedFilename().endsWith('.xlsx'));
 const saved=await p.evaluate(id=>({compressed:localStorage.getItem('masal-v1').startsWith('MASAL-LZW1:'),request:app.s.exportRequests.find(r=>r.id===id).status,qty:app.s.exports[0].quantity,size:localStorage.getItem('masal-v1').length,padding:localStorage.getItem('quota-fixture').length}),info.request);
 assert(saved.compressed);assert.equal(saved.request,'تم التنزيل');assert.equal(saved.qty,6000);assert.equal(saved.padding,info.padding);
 await p.reload();await p.waitForFunction(()=>window.app&&typeof app.go==='function');const restored=await p.evaluate(batch=>({qty:app.s.cards.filter(c=>c.batch===batch&&c.status==='Exported').length,pin:app.s.cards.find(c=>c.batch===batch)?.pin,record:app.s.exports.find(r=>r.batch===batch)?.quantity}),info.batch);
 assert.equal(restored.qty,6000);assert.equal(restored.pin,'00012345600000');assert.equal(restored.record,6000);assert.deepEqual(errors,[]);
 console.log('PASS lossless Unicode/reset encoding, real quota recovery, 6000-card approval/download, unrelated data retained and reload persistence',JSON.stringify({raw:info.raw,stored:saved.size}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
