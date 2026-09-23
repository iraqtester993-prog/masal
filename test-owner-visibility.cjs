const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));
 await page.waitForSelector('.pagehead');
 const check=await page.evaluate(()=>{
  app.s.users.push({id:'STOPPED',name:'موظف موقوف',role:'employee',assigned:['A2'],active:false,email:'stopped@example.test',credentials:{hash:'SECRET-HASH',salt:'SECRET-SALT'}});
  app.s.notifications.push({id:'DIRECT',target:'STOPPED',title:'إشعار حساب',body:'اختبار'});
  app.s.audit.push({id:'EVENT',user:'STOPPED',name:'موظف موقوف',action:'تعديل سجل',entity:'TEST',time:new Date().toISOString(),before:{name:'قديم'},after:{name:'جديد',password:'SECRET-PASSWORD',credentials:{hash:'SECRET-HASH'}}});
  app.actor.access={scope:{roots:['A1'],descendants:false},overrides:{'users.view':'deny'}};
  app.go('users');
  return {users:app.filteredRows.length,total:app.s.users.length,agents:app.visibleAgents.length,allAgents:app.s.agents.length,pos:app.visiblePOS.length,allPOS:app.s.pos.length,batches:app.visibleBatches.length,allBatches:app.s.batches.length,notifications:app.visibleNotifications.length,allNotifications:app.s.notifications.length,permissions:MasalAccess.catalog.every(p=>app.can(p.key)),summary:app.accountSummary[0].value};
 });
 assert.equal(check.users,check.total);assert.equal(check.summary,check.total);assert.equal(check.agents,check.allAgents);assert.equal(check.pos,check.allPOS);assert.equal(check.batches,check.allBatches);assert.equal(check.notifications,check.allNotifications);assert.ok(check.permissions);
 await page.evaluate(()=>app.showAccountDetails(app.s.users.find(u=>u.id==='STOPPED')));
 assert.equal(await page.evaluate(()=>app.accountDetails.audit.length),1);
 assert.equal(await page.evaluate(()=>app.accountDetails.agents[0].id),'A2');
 assert.equal(await page.evaluate(()=>app.accountDetails.permissions.length),0);
 await page.locator('.account-event summary').click();
 const text=await page.locator('.account-details').innerText();assert.ok(text.includes('جديد'));assert.ok(!text.includes('SECRET-'));
 for(const width of [390,768,1500]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);}
 await page.evaluate(()=>{app.closeModal();app.currentUser='U3';app.switchUser();app.go('users')});
 assert.equal(await page.locator('.owner-summary:visible').count(),0);
 assert.equal(await page.getByRole('button',{name:'تفاصيل الحساب',exact:true}).count(),0);
 assert.equal(await page.evaluate(()=>app.visibleAgents.some(a=>a.id==='A2')),false);
 assert.equal(await page.evaluate(()=>app.filteredRows.some(u=>u.id==='STOPPED')),false);
 assert.equal(await page.evaluate(()=>{app.showAccountDetails(app.s.users.find(u=>u.id==='STOPPED'));return app.modal?.kind==='accountDetails'}),false);
 await page.reload();await page.waitForSelector('.pagehead');await page.evaluate(()=>app.go('users'));
 assert.equal(await page.evaluate(()=>app.filteredRows.length===app.s.users.length),true);
 assert.deepEqual(errors,[]);
 console.log('PASS owner sees all accounts including stopped/unassigned, all branches and notifications; account details and audit redact secrets; responsive; lower-role isolation; reload');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
