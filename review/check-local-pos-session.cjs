const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.app);
 const result=await p.evaluate(()=>{
  app.engine.fund('A1','POS1',150000,'voucher','session-test',app.engine.authorizeFunding('A1','test').id);
  app.currentUser='U5';app.switchUser();app.go('sell');app.saleForm.product='C1';app.saleForm.quantity=1;const point=app.s.pos.find(x=>x.id==='POS1');point.online=false;
  const before={sales:app.s.sales.length,balance:app.engine.serviceAvailable('POS1')};app.sell();const denied=app.toast.text;
  const noChange=before.sales===app.s.sales.length&&before.balance===app.engine.serviceAvailable('POS1');
  point.active=false;app.startLocalPOSSession();const inactiveBlocked=!point.online;point.active=true;
  app.s.settings.sales=false;app.startLocalPOSSession();const salesBlocked=!point.online;app.s.settings.sales=true;
  app.s.settings.printing=false;app.startLocalPOSSession();const printingBlocked=!point.online;app.s.settings.printing=true;
  const a=app.s.agents.find(a=>a.id===point.agent);a.active=false;app.startLocalPOSSession();const agentBlocked=!point.online;a.active=true;
  app.saleForm.pos='POS2';app.startLocalPOSSession();const otherBlocked=/نقطة أخرى|خارج نطاق/.test(app.toast.text);app.saleForm.pos='POS1';return {denied,noChange,inactiveBlocked,salesBlocked,printingBlocked,agentBlocked,otherBlocked};
 });assert.match(result.denied,/غير متصل/);for(const [k,v]of Object.entries(result))if(k!=='denied')assert.equal(v,true,k);
 await p.getByRole('button',{name:'بدء جلسة الجهاز التجريبية',exact:true}).click();assert.equal(await p.evaluate(()=>app.selectedPOS.online),true);assert.equal(await p.locator('.local-session-prompt').count(),0);
 const sale=await p.evaluate(()=>{const before=app.s.sales.length;app.sell();return {added:app.s.sales.length-before,kind:app.modal?.kind,status:app.modal?.tx?.status}});assert.deepEqual(sale,{added:1,kind:'receipt',status:'Print Requested'});assert.deepEqual(errors,[]);console.log('PASS offline blocks without debit; local session button enables receipt; inactive POS, stopped ancestor, global sales/print stops and other POS remain protected');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
