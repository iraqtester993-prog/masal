const fs=require('node:fs'),assert=require('node:assert/strict');
const {Engine,seed}=require('../engine.js');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const results=[];
 let e=new Engine(seed(),'U1'),before=e.balance('A1');
 e.transfer('A1','POS2',100);e.transfer('A1','POS2',100);
 assert.equal(before-e.balance('A1'),200);
 results.push({id:'G01',finding:'Owner can fund an agent POS without an exception request; repeated calls debit twice',confirmed:true});
 e=new Engine(seed(),'U1');before=e.balance('A1');
 const b=e.importBatch({agent:'A1',product:'C1',cost:4000,expenses:0,expiry:'2028-12-31'},[{pin:'REVIEW-ONLY',serial:'REVIEW-ONLY',expiry:'2028-12-31'}]);
 assert.equal(e.balance('A1'),before);assert.equal(e.s.ledger.filter(l=>l.group===b.id).length,0);
 results.push({id:'G02',finding:'Import does not create operational credit, batch invoice or a batch ledger entry',confirmed:true});
 e=new Engine(seed(),'U1');const t=e.sell('POS2','C1',1,'review');e.printResult(t.id,false);e.s.agents.find(a=>a.id==='A1').reprint=0;e.reprint(t.id,'review only');
 assert.equal(t.reprints,1);
 results.push({id:'G03',finding:'Agent reprint limit is ignored; POS limit remains effective',confirmed:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();await page.goto('file:///'+require('node:path').resolve('masal.html').replaceAll('\\','/'));await page.waitForSelector('.pagehead');
  const ui=await page.evaluate(()=>{
   app.s.notifications.push({id:'REVIEW-ONLY',target:'A3',title:'review',body:'test'});
   app.currentUser='U5';app.switchUser();
   const notificationVisible=app.visibleNotifications.some(n=>n.id==='REVIEW-ONLY');
   return {notificationVisible,pointAgent:app.actor.agent};
  });
  assert.equal(ui.pointAgent,'A3');assert.equal(ui.notificationVisible,false);
  results.push({id:'G04',finding:'POS does not see notification targeted at its own agent',confirmed:true});
 }finally{await browser.close()}
 fs.writeFileSync('review/verified-gaps.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
