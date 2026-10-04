require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MASAL_TEST_URL||require('url').pathToFileURL(require('path').resolve('masal.html')).href);await page.waitForFunction(()=>window.app);
 await page.evaluate(async()=>{
  app.currentUser='U1';app.loginScreen=false;
  const s=app.s,e=app.engine,a=s.agents.find(a=>a.active&&!a.parent),p=s.products.find(p=>p.active&&s.prices.some(x=>x.agent===a.id&&x.product===p.id));
  const check=(v,m)=>{if(!v)throw Error(m)},deny=fn=>{try{fn()}catch{return true}return false};
  p.orderIdentifier='00125';p.allowedCities=[];a.allowedProductIds=s.products.map(p=>p.id);s.providers.find(v=>v.id===p.provider).active=true;
  const source=e.saveOrderSource({name:'Identifier test',provider:p.provider});app.go('import');await Vue.nextTick();
  const f=app.$refs.cashOrder.$refs.multi;f.draft={key:'IDENTIFIER',agent:a.id,provider:p.provider,sourceId:source.id,city:a.city,product:p.id,lines:[]};
  f.add(MasalOrderParser.parseText('serial,pin,expiry\nID-S1,00012345678901,2099-12-31'));f.draft.lines[0].cost=100;
  check(f.draft.lines[0].product===p.id,'upload uses selected category');check(e.checkMultiOrder(f.draft).quantity===1,'selected category accepted');
  f.draft.product='';f.draft.lines=[];
  f.add(MasalOrderParser.parseText('category_id,serial,pin,expiry\n00125,ID-S2,00012345678902,2099-12-31'));f.draft.lines[0].cost=100;
  check(f.draft.lines[0].product===p.id,'identifier automatically resolved');check(f.draft.lines[0].categoryCode==='00125','leading zeros retained');
  const other={...Masal.clone(p),id:'IDENTIFIER-OTHER',orderIdentifier:'00126'};s.products.push(other);a.allowedProductIds.push(other.id);
  f.draft.product=other.id;check(deny(()=>e.checkMultiOrder(f.draft)),'selection conflict blocked');f.draft.product=p.id;
  const record=e.submitMultiOrder(f.draft);check(MasalMultiOrders.draftOf(record).product===p.id,'selection persists');e.reviewMultiOrder(record.id,'approve');check(s.cards.some(c=>c.serial==='ID-S2'&&c.product===p.id),'correct inventory');
  check(e.resolveOrderProduct(p.provider,'125').length===0,'zeros distinguish identifier');
  for(const identifier of ['EVS-E5K','EVD-EV5','EVD1','EVD2','EV5C','EB25','EVS-EU50K']){p.orderIdentifier=identifier;check(e.resolveOrderProduct(p.provider,MasalOrderParser.code(identifier))[0]?.id===p.id,'full identifier prefixes: '+identifier)}p.orderIdentifier='00125';
  app.go('products');app.openEdit(p);check(app.editForm.importCodes.includes('00125')&&!Object.hasOwn(app.editForm,'orderIdentifier'),'legacy identifier merged into single field');app.openEdit(other);app.editForm.dailyLimitType='quantity';app.editForm.dailyQty=100;app.editForm.importCodes=' 00125 ';app.saveEntity();check(s.products.find(x=>x.id===other.id).orderIdentifier==='00126','duplicate identifier rejected');
 });
 await assert.equal(await page.locator('input[placeholder="EVS-E5K, EVD-EV5"]').count(),1);assert.deepEqual(errors,[]);
 console.log('PASS optional category upload, identifier matching, leading zeros, conflict guard, persistence, inventory and duplicate prevention');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
