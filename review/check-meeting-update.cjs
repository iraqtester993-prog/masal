const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await p.evaluate(()=>app.enterLoginDemo());
for(const page of ['company','branding','prices','import','permissions','security','support','products','providers','dashboard']){await p.evaluate(page=>app.go(page),page);await p.waitForTimeout(80)}
assert.deepEqual(errors,[]);
const result=await p.evaluate(()=>{const s=Masal.seed(),e=new Masal.Engine(s,'U1');e.operations();s.settings.velocity=0;
e.alignStock('A1');const price=e.policyPrice('A1','C1');if(price!==e.policyPrice('A3','C1'))throw Error('inheritance');
const old=s.cards.filter(c=>c.agent==='A1'&&c.product==='C1');old[0].created='2020-01-01';old[0].expiry='2030-01-01';old[1].created='2025-01-01';old[1].expiry='2029-01-01';
e.fund('A1','POS1',price*2,'voucher','CHECK',e.authorizeFunding('A1','اختبار').id);const before=e.serviceBalance('POS1'),main=e.serviceBalance('A1');const t=e.sell('POS1','C1',1,'SELL');
if(t.cards[0]!==old[0].id)throw Error('not FIFO');if(t.credit!==t.total||before-e.serviceBalance('POS1')!==t.total)throw Error('incorrect debit');if(e.serviceBalance('A1')!==main)throw Error('double debit');if(Math.abs(e.reconcile('A1').difference)>0.001)throw Error('reconcile');
const after=e.serviceBalance('POS1');e.sell('POS1','C1',1,'SELL');if(e.serviceBalance('POS1')!==after)throw Error('duplicate');
e.savePricePolicy({agent:'A1',product:'C1',price:price+100,effective:Masal.day(),rate:100});if(e.policyPrice('A3','C1')!==price+100)throw Error('IQD');if(Math.abs(e.reconcile('A1').difference)>0.001)throw Error('repricing');
e.expiryAlerts();const count=s.notifications.filter(n=>n.audience==='expiry').length;e.expiryAlerts();if(s.notifications.filter(n=>n.audience==='expiry').length!==count)throw Error('duplicate alerts');if(!count)throw Error('missing alert');if(s.notifications.some(n=>n.audience==='expiry'&&n.recipientUsers.some(id=>s.users.find(u=>u.id===id).role==='pos')))throw Error('POS expiry notification');
return {price,total:t.total,credit:t.credit,profit:t.agentMargin,alerts:count,difference:e.reconcile('A1').difference}});
console.log('PASS',result);assert.deepEqual(errors,[]);
console.log(await p.evaluate(()=>{
 const check=(ok,msg)=>{if(!ok)throw Error(msg)},s=Masal.seed(),e=new Masal.Engine(s,'U1');e.operations();s.settings.velocity=0;
 const before=e.serviceBalance('A1'),price=e.policyPrice('A1','C1');e.alignStock('A1');const base=e.serviceBalance('A1');
 const b=e.importBatch({agent:'A1',product:'C1',cost:4400,loadPrice:1,expenses:0,expiry:'2030-01-01',postingKey:'IMPORT-CHECK'},[{pin:'UNIQUE-CHECK',serial:'CHECK-SERIAL',expiry:'2030-01-01'}]);
 check(e.serviceBalance('A1')-base===price,'import must use selling price');const balance=e.serviceBalance('A1');e.importBatch({agent:'A1',product:'C1',cost:4400,expiry:'2030-01-01',postingKey:'IMPORT-CHECK'},[]);check(e.serviceBalance('A1')===balance,'duplicate import');
 e.batchAction(b.id,'quarantine');check(e.serviceBalance('A1')===balance-price,'withdraw debit');const held=e.serviceBalance('A1');e.batchAction(b.id,'quarantine');check(e.serviceBalance('A1')===held,'double withdrawal');
 e.setOperationStops('pos','POS1',{printing:true});let blocked=false;try{e.sell('POS1','C1',1,'BLOCK')}catch(x){blocked=/الطباعة/.test(x.message)}check(blocked,'printing stop');e.setOperationStops('pos','POS1',{});
 e.setOperationStops('agent','A1',{import:true});blocked=false;try{e.importBatch({agent:'A1',product:'C1'},[])}catch(x){blocked=/الطلبيات/.test(x.message)}check(blocked,'import stop');e.setOperationStops('agent','A1',{});
 const ticket=new Masal.Engine(s,'U5').sendSupport({recipient:'A3',title:'مشكلة',description:'تفاصيل'}),sub=new Masal.Engine(s,'U4'),main=new Masal.Engine(s,'U3'),point=new Masal.Engine(s,'U5');
 sub.changeSupport(ticket.id,'مصعّدة');main.changeSupport(ticket.id,'مصعّدة');check(!point.supportReplyAllowed(ticket),'point bypass');e.replySupport(ticket.id,'جواب الإدارة');check(ticket.recipient==='A1','reply to main');check(point.visibleSupportReplies(ticket).length===0,'private upstream reply');main.replySupport(ticket.id,'جواب الرئيسي');check(ticket.recipient==='A3','reply to sub');sub.replySupport(ticket.id,'تم الحل');check(point.visibleSupportReplies(ticket).length===1,'point gets direct reply');sub.changeSupport(ticket.id,'مغلقة');
 const original=JSON.stringify(s);blocked=false;try{point.setOperationStops('agent','A1',{login:true})}catch{blocked=true}check(blocked&&JSON.stringify(s)===original,'security authorization');
 const fresh=Masal.seed(),fe=new Masal.Engine(fresh,'U1');fe.operations();fe.alignStock('A1');fe.fund('A1','POS1',fe.serviceAvailable('A1'),'voucher','ALL',fe.authorizeFunding('A1','اختبار').id);const snap=JSON.stringify(fresh);blocked=false;try{fe.savePricePolicy({agent:'A1',product:'C1',price:4500,effective:Masal.day()})}catch{blocked=true}check(blocked&&JSON.stringify(fresh)===snap,'repricing rollback');return 'PASS import, withdrawal, idempotency, operation stops, sequential private support replies';
}));
await p.evaluate(()=>app.go('company'));assert.equal(await p.getByRole('button',{name:/تعديل/}).count(),1);
await p.getByRole('button',{name:/تعديل/}).click();await p.getByLabel('اسم الشركة',{exact:true}).fill('ماسال للاختبار');await p.getByRole('button',{name:/حفظ/}).click();assert.equal(await p.evaluate(()=>app.s.companyProfile.name),'ماسال للاختبار');
await p.evaluate(()=>{app.currentUser='U5';app.switchUser();app.go('company')});assert.equal(await p.getByRole('button',{name:/تعديل/}).count(),0);
await p.setViewportSize({width:390,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);assert.deepEqual(errors,[]);console.log('PASS pages, company edit isolation, mobile');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});



