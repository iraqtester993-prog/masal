const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
const p=await b.newPage({viewport:{width:1500,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(pathToFileURL(path.resolve('masal.html')).href);await p.waitForFunction(()=>window.app);
await p.evaluate(async()=>{const s=Masal.seed();MasalOperations.initialize(s);app.s=s;app.currentUser='U1';app.loginScreen=false;app.engine.serviceCredit('A1','cash',1000,'TEST','cash-open');app.go('wallets');await Vue.nextTick();app.$refs.operations.tab='bulk';app.$refs.operations.service='cash'});
await p.locator('.wallet-advanced > summary').click();await p.getByLabel('الممول للتمويل المتعدد').selectOption('A1');
const names=await p.evaluate(()=>app.$refs.operations.bulkRecipients.map(a=>({id:a.id,name:a.name})));
for(const [id,value] of [['A3','100'],['POS1','200']]){const name=names.find(a=>a.id===id).name;await p.getByRole('checkbox',{name:'اختيار '+name,exact:true}).check();await p.getByRole('textbox',{name:'مبلغ '+name,exact:true}).fill(value)}
await p.getByRole('button',{name:'معاينة المجموعة',exact:true}).click();
const dialog=p.getByRole('dialog',{name:'معاينة مجموعة التمويل'});await dialog.waitFor();assert(await dialog.evaluate(e=>e.matches(':modal')&&e.parentElement===document.body));
assert.equal(await p.evaluate(()=>app.$refs.operations.fundingPreview.valid),true);
assert.equal(await p.evaluate(()=>app.engine.serviceBalance('A1','cash')),1000);
await p.getByRole('button',{name:'تأكيد التمويل',exact:true}).click();
assert.equal(await dialog.count(),0);
assert.deepEqual(await p.evaluate(()=>['A1','A3','POS1'].map(a=>app.engine.serviceBalance(a,'cash'))),[700,100,200]);
assert.equal(await p.evaluate(()=>app.s.fundingBatches.length),1);
await p.evaluate(()=>{
 const e=app.engine,s=app.s,check=(v,m)=>{if(!v)throw Error(m)},deny=fn=>{let denied=false;try{fn()}catch{denied=true}check(denied,'Expected rejection')};
 const b=s.fundingBatches[0],rows=JSON.parse(b.payload),entries=s.serviceLedger.length;e.bulkFunding(rows,null,b.key);check(s.serviceLedger.length===entries,'Retry duplicated debit');
 deny(()=>e.bulkFunding([{...rows[0],amount:101},rows[1]],null,b.key));
 const before=JSON.stringify(s);deny(()=>e.bulkFunding([{from:'A1',to:'A3',amount:800,service:'cash'},{from:'A1',to:'POS1',amount:1,service:'cash'}],null,'no-money'));check(JSON.stringify(s)===before,'Insufficient funds mutated state');
 deny(()=>e.bulkFunding([{from:'A1',to:'A3',amount:1,service:'cash'},{from:'A2',to:'POS3',amount:1,service:'cash'}],null,'mixed-source'));
 deny(()=>e.bulkFunding([{from:'A1',to:'POS3',amount:1,service:'cash'}],null,'other-tree'));
 const main=new Masal.Engine(s,'U3');check(!main.canFundFrom('A2'),'Foreign payer allowed');deny(()=>main.bulkFunding([{from:'A2',to:'POS3',amount:1,service:'cash'}],null,'forbidden'));
 s.users.push({id:'BULK-EMP',name:'موظف',active:true,role:'employee',staffAccount:'A1',agent:'',access:{overrides:{'wallets.view':'allow','wallets.transfer':'allow','wallets.bulk':'allow'}}});
 const emp=new Masal.Engine(s,'BULK-EMP');check(emp.previewFundingBatch([{from:'A1',to:'A3',amount:1,service:'cash'}]).valid,'Staff account mismatch');emp.bulkFunding([{from:'A1',to:'A3',amount:1,service:'cash'}],null,'staff');check(e.serviceBalance('A1','cash')===699,'Staff debit');s.users.find(u=>u.id==='BULK-EMP').access.overrides['wallets.bulk']='deny';deny(()=>emp.bulkFunding([{from:'A1',to:'A3',amount:1,service:'cash'}],null,'staff-denied'));
 });
// A balance change after preview is rechecked by confirmation; no partial transfer.
await p.evaluate(async()=>{const v=app.$refs.operations;v.bulkSelected=['A3'];v.bulkAmounts={A3:600};await Vue.nextTick();v.prepareFunding('bulk')});
await dialog.waitFor();await p.evaluate(()=>app.engine.fund('A1','POS1',200,'cash','intervening'));
await p.getByRole('button',{name:'تأكيد التمويل',exact:true}).click();await dialog.getByRole('alert').waitFor();assert.equal(await p.evaluate(()=>app.engine.serviceBalance('A1','cash')),499);
await p.setViewportSize({width:390,height:844});const box=await dialog.boundingBox();assert(box.x>=0&&box.x+box.width<=390);
await dialog.getByRole('button',{name:'إلغاء',exact:true}).click();assert.equal(await dialog.count(),0);
assert.deepEqual(errors,[]);console.log('PASS owner bulk modal, exact payer debit and recipient credits, retry safety, insufficient balance atomicity, scope, mixed payer denial, staffAccount identity, revoked permission, stale preview and mobile');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
