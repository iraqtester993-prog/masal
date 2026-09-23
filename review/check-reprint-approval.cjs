const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.app);
const out=await p.evaluate(async()=>{
const results={},blocked=fn=>{try{fn();return false}catch{return true}},user=id=>{app.currentUser=id;app.switchUser()};
app.engine.fund('A1','POS1',20000,'voucher','test',app.engine.authorizeFunding('A1','test').id);user('U5');const t=app.engine.sell('POS1','C1',1,'reprint-test');app.engine.printResult(t.id,false);
const before=JSON.stringify([app.s.serviceLedger,app.s.cards.map(c=>[c.id,c.status]),app.s.sales.length]);const balance=app.engine.serviceAvailable('POS1');
app.engine.reprint(t.id,'failed paper');const r=app.s.printOverrides.find(r=>r.id===t.reprintApproval);
results.pending=r.status==='قيد المراجعة';results.resultBlocked=blocked(()=>app.engine.printResult(t.id,true));results.printBlocked=blocked(()=>app.engine.assertPrintReady(t.id));results.noDuplicate=app.engine.requestReprint(t.id,'again').id===r.id;
app.viewReceipt(t);await Vue.nextTick();results.hidden=!Array.from(document.querySelectorAll('.formfoot button')).some(b=>/تأكيد نجاح الطباعة|طباعة المتصفح/.test(b.textContent));
user('U4');results.subCan=app.can('exceptions.approve')&&app.engine.canApproveReprint(r);app.engine.approveReprint(r.id,true);results.approved=app.engine.assertPrintReady(t.id).id===t.id;
user('U5');app.viewReceipt(t);await Vue.nextTick();results.buttons=Array.from(document.querySelectorAll('.formfoot button')).some(b=>b.textContent.includes('تأكيد نجاح الطباعة'));app.engine.printResult(t.id,false);results.consumed=r.status==='مستخدم'&&blocked(()=>app.engine.printResult(t.id,true));
app.engine.reprint(t.id,'try again');const r2=app.s.printOverrides.find(r=>r.id===t.reprintApproval);user('U4');app.engine.approveReprint(r2.id,false);results.rejected=t.status==='Print Failed'&&blocked(()=>app.engine.assertPrintReady(t.id));
user('U5');app.engine.reprint(t.id,'third');const r3=app.s.printOverrides.find(r=>r.id===t.reprintApproval);user('U3');app.engine.approveReprint(r3.id,true);user('U5');app.engine.printResult(t.id,true);results.success=t.status==='Reprinted';results.sameBalance=app.engine.serviceAvailable('POS1')===balance;
user('U4');app.engine.reprint(t.id,'agent request');const r4=app.s.printOverrides.find(r=>r.id===t.reprintApproval);results.selfDenied=blocked(()=>app.engine.approveReprint(r4.id,true));user('U3');app.engine.approveReprint(r4.id,true);
// Legacy pending attempts are migrated into the approval queue without charging again.
t.status='Reprint Requested';delete t.reprintApproval;t.attempts.push({status:'Reprint Requested',user:'U5',reason:'legacy'});app.engine.operations();const migrated=app.s.printOverrides.find(r=>r.id===t.reprintApproval);results.migrated=migrated.status==='قيد المراجعة'&&blocked(()=>app.engine.assertPrintReady(t.id));
return results;});for(const [k,v]of Object.entries(out))assert.equal(v,true,k);assert.deepEqual(errors,[]);console.log('PASS approval required; buttons hidden pending; direct result blocked; sub/ancestor approval; self approval denied; single-use on failure and success; rejection; no extra debit; legacy pending migration');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
