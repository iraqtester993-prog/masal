const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage({viewport:{width:1440,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+path.resolve('masal.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.app);
 const branch=await p.evaluate(async()=>{
  app.currentUser='U4';app.switchUser();app.go('agents');app.openEdit();Object.assign(app.editForm,{name:'Sub B',city:'بغداد',phone:'07700000000'});app.networkLogin={email:'sub-b@example.test',password:'TestingOnly123'};await app.saveEntity();const b=app.s.agents.find(a=>a.name==='Sub B'),u=app.s.users.find(u=>u.email==='sub-b@example.test');if(!u)throw Error(app.toast?.text);return {id:b.id,user:u.id,parent:b.parent};
 });assert.equal(branch.parent,'A3');
 const child=await p.evaluate(async branch=>{
  app.currentUser=branch.user;app.switchUser();app.go('agents');app.openEdit();Object.assign(app.editForm,{name:'Sub C',city:'بغداد',phone:'07700000001'});app.networkLogin={email:'sub-c@example.test',password:'TestingOnly123'};await app.saveEntity();const c=app.s.agents.find(a=>a.name==='Sub C'),u=app.s.users.find(u=>u.email==='sub-c@example.test');if(!u)throw Error(app.toast?.text);return {id:c.id,user:u.id,parent:c.parent};
 },branch);assert.equal(child.parent,branch.id);
 const point=await p.evaluate(async child=>{
  app.currentUser=child.user;app.switchUser();app.go('pos');app.openEdit();Object.assign(app.editForm,{name:'Nested Point',owner:'Test',city:'بغداد',address:'Test',phone:'07700000002',serial:'NESTED-TEST',model:'Test',version:'1.0.0',reprint:2});app.networkLogin={email:'nested-pos@example.test',password:'TestingOnly123'};await app.saveEntity();const pos=app.s.pos.find(a=>a.name==='Nested Point'),u=app.s.users.find(u=>u.email==='nested-pos@example.test');if(!u)throw Error(app.toast?.text);return {id:pos.id,user:u.id,agent:pos.agent};
 },child);assert.equal(point.agent,child.id);
 const result=await p.evaluate(({branch,child,point})=>{
  const result={},N=MasalNetworkAccounts,E=id=>new Masal.Engine(app.s,id);const failed=fn=>{try{fn();return false}catch{return true}};
  result.mainRoot=E(point.user).main(child.id)==='A1';
  result.nestedScope=E('U3').scope().includes(child.id)&&E('U4').scope().includes(child.id)&&!E(child.user).scope().includes('A3');
  result.noSelf=failed(()=>N.saveNetworkPermissions(E(branch.user),'agents',branch.id,{'pos.create':false},'test'));
  result.noParent=failed(()=>N.saveNetworkPermissions(E(child.user),'agents',branch.id,{'pos.create':false},'test'));
  result.noOther=failed(()=>N.saveNetworkPermissions(E('U3'),'agents','A2',{'pos.create':false},'test'));
  N.saveNetworkPermissions(E('U1'),'agents','A3',{'agents.create':false},'owner restriction');
  result.cascade=!E('U4').can('agents.create')&&!E(branch.user).can('agents.create')&&!E(child.user).can('agents.create');
  result.pointsIndependent=E('U4').can('pos.create')&&E(branch.user).can('pos.create')&&E(child.user).can('pos.create');
  result.cannotRestore=failed(()=>N.saveNetworkPermissions(E(branch.user),'agents',child.id,{'agents.create':true},'bypass'));
  result.mainCannotEraseOwner=failed(()=>N.saveNetworkPermissions(E('U3'),'agents','A3',{'agents.create':true},'bypass'));
  N.saveNetworkPermissions(E('U1'),'agents','A3',{'agents.create':true},'restore');result.restored=E(child.user).can('agents.create');
  N.saveNetworkPermissions(E(branch.user),'agents',child.id,{'pos.create':false},'disable points');result.onlyPointsDenied=!E(child.user).can('pos.create')&&E(child.user).can('agents.create');
  N.saveNetworkPermissions(E('U3'),'agents',child.id,{'pos.create':true},'higher overrides lower');result.higherCanRestore=E(child.user).can('pos.create');
  N.saveNetworkPermissions(E('U3'),'agents',child.id,{'agents.permissions':false},'deny delegation');result.delegationDenied=failed(()=>N.saveNetworkPermissions(E(child.user),'pos',point.id,{'sell.create':false},'test'));
  N.saveNetworkPermissions(E('U1'),'agents',child.id,{'agents.permissions':true},'restore');
  const before=JSON.stringify(app.s.agents.find(a=>a.id===child.id).networkRules);result.atomic=failed(()=>N.saveNetworkPermissions(E(branch.user),'agents',child.id,{'pos.create':false,'security.app':true},'bad'))&&before===JSON.stringify(app.s.agents.find(a=>a.id===child.id).networkRules);
  N.saveNetworkPermissions(E(branch.user),'pos',point.id,{'sell.create':false},'stop sales');result.posDenied=!E(point.user).can('sell.create');N.saveNetworkPermissions(E('U1'),'pos',point.id,{'sell.create':true},'restore');
  app.currentUser='U1';app.switchUser();const owner=E('U1');owner.fund('A1','A3',13500,'voucher','nested-fund-1',owner.authorizeFunding('A1','test').id);
  E('U4').fund('A3',branch.id,9000,'voucher','nested-fund-2');E(branch.user).fund(branch.id,child.id,9000,'voucher','nested-fund-3');E(child.user).fund(child.id,point.id,9000,'voucher','nested-fund-4');result.funding=E(point.user).serviceAvailable(point.id)===9000;
  app.s.prices.push({agent:child.id,product:'C1',price:4750,effective:Masal.day()});app.s.pos.find(x=>x.id===point.id).online=true;const a=app.s.agents.find(a=>a.id===branch.id);a.active=false;result.suspendedAncestorBlocks=failed(()=>E(point.user).sell(point.id,'C1',1,'nested-sale'));a.active=true;result.nestedSale=!!E(point.user).sell(point.id,'C1',1,'nested-sale').id;
  app.currentUser='U3';app.switchUser();app.go('agents');result.tree=app.networkTree.some(n=>JSON.stringify(n).includes('Sub C'));
  result.audit=app.s.audit.some(x=>x.action==='تعديل صلاحيات تابع');return result;
 },{branch,child,point});for(const [k,v]of Object.entries(result))assert.equal(v,true,k);
 await p.locator('[data-agent="'+child.id+'"] button').filter({hasText:'صلاحيات التابع'}).click();await p.locator('[data-network-permission="agents.create"]').uncheck();assert.equal(await p.locator('[data-network-permission="pos.create"]').isChecked(),true);await p.getByLabel('سبب التعديل',{exact:true}).fill('UI independent permission test');await p.locator('.network-permissions-form .formfoot .primary').click();await p.waitForFunction(()=>!app.modal);
 assert.equal(await p.evaluate(id=>new Masal.Engine(app.s,id).can('agents.create'),child.user),false);
 await p.evaluate(id=>app.openNetworkPermissions('agents',id),child.id);await p.waitForTimeout(250);await p.screenshot({path:'review/nested-permissions-desktop.png'});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'review/nested-permissions-mobile.png'});assert.equal(await p.evaluate(()=>document.querySelector('.modal').scrollWidth>document.querySelector('.modal').clientWidth+2),false);
 await p.reload();await p.waitForFunction(()=>window.app);assert.equal(await p.evaluate(id=>new Masal.Engine(app.s,id).can('agents.create'),child.user),false);assert.equal(await p.evaluate(id=>new Masal.Engine(app.s,id).can('pos.create'),child.user),true);assert.deepEqual(errors,[]);
 console.log('PASS nested agent/point creation, scope, ancestor priority, independent permissions, cross-network/self/parent denial, grant caps, atomic rejection, multilevel funding, suspension, sale, tree, actual checkbox save, reload and mobile');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
