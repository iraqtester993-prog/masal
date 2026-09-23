const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));await page.waitForSelector('.pagehead');
 const result=await page.evaluate(()=>{
  app.engine.fund('A1','POS1',150000,'voucher','test-suspension',app.engine.authorizeFunding('A1','تهيئة اختبار').id);app.currentUser='U3';app.switchUser();const result={agentPermission:app.can('agents.toggle'),posPermission:app.can('pos.toggle'),globalControls:app.can('security.sales')};
  app.go('agents');app.treeView=false;const branch=app.s.agents.find(a=>a.id==='A3'),other=app.s.agents.find(a=>a.id==='A2');
  app.toggleEntity(branch);result.branchStopped=!branch.active;
  try{app.engine.sell('POS1','C1',1,'blocked-branch')}catch(e){result.branchSaleBlocked=e.message.includes('موقوف')}
  const otherBefore=other.active;app.toggleEntity(other);result.otherUnchanged=other.active===otherBefore;
  app.toggleEntity(branch);result.branchResumed=branch.active;
  app.go('pos');const point=app.s.pos.find(p=>p.id==='POS1'),direct=app.s.pos.find(p=>p.id==='POS2'),outside=app.s.pos.find(p=>p.id==='POS3');
  app.toggleEntity(point);result.pointStopped=!point.active;
  try{app.engine.sell('POS1','C1',1,'blocked-point')}catch(e){result.pointSaleBlocked=e.message.includes('موقوفة')}
  result.directUnaffected=direct.active;const outsideBefore=outside.active;app.toggleEntity(outside);result.outsideUnchanged=outside.active===outsideBefore;
  app.toggleEntity(point);result.pointResumed=point.active;app.toggleEntity(direct);result.directStopped=!direct.active;app.toggleEntity(direct);
  result.saleResumed=!!app.engine.sell('POS1','C1',1,'resumed').id;
  app.actor.access={overrides:{'pos.toggle':'deny'}};const before=point.active;app.toggleEntity(point);result.permissionDenialRespected=point.active===before;
  result.audit=app.s.audit.filter(a=>a.action==='تغيير التفعيل').map(a=>a.entity);
  delete app.actor.access;return result;
 });
 for(const key of ['agentPermission','posPermission','branchStopped','branchSaleBlocked','otherUnchanged','branchResumed','pointStopped','pointSaleBlocked','directUnaffected','outsideUnchanged','pointResumed','directStopped','saleResumed','permissionDenialRespected'])assert.equal(result[key],true,key);
 assert.equal(result.globalControls,false);assert.deepEqual(result.audit.sort(),['A3','A3','POS1','POS1','POS2','POS2']);
 const row=page.locator('tbody tr').filter({hasText:'مكتبة الرافدين'});await row.getByRole('button',{name:'إيقاف',exact:true}).click();assert.equal(await page.evaluate(()=>app.s.pos.find(p=>p.id==='POS2').active),false);await row.getByRole('button',{name:'تفعيل',exact:true}).click();assert.equal(await page.evaluate(()=>app.s.pos.find(p=>p.id==='POS2').active),true);
 assert.deepEqual(errors,[]);console.log('PASS main agent can suspend/resume branches and direct/descendant POS; sales blocked accordingly; other networks and denied permissions protected; audit recorded; real UI buttons work');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
