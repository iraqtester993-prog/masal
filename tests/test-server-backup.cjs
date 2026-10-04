require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];let downloads=0;p.on('pageerror',e=>errors.push(e.message));p.on('download',()=>downloads++);
 await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await p.waitForFunction(()=>window.app);
 await p.evaluate(async()=>{app.currentUser='U1';app.loginScreen=false;app.go('backup');await Vue.nextTick()});
 const button=p.getByRole('button',{name:'نسخ احتياطي',exact:true});await button.click();
 await p.evaluate(async()=>{
  const check=(v,m)=>{if(!v)throw Error(m)},messages=[];app.notify=(message,error)=>messages.push({message,error});
  await app.backup();check(messages.at(-1).error&&messages.at(-1).message.includes('غير مربوط'),'unconnected status');
  let calls=0,finish;globalThis.MasalBackupServer={create(){calls++;return new Promise(resolve=>finish=resolve)}};
  const pending=app.backup();await Vue.nextTick();check(app.serverBackupBusy,'busy state');await app.backup();check(calls===1,'duplicate prevented');finish({id:'SERVER-TEST',status:'completed'});await pending;
  check(!app.serverBackupBusy&&!messages.at(-1).error,'confirmed success');check(app.s.audit.some(r=>r.entity==='SERVER-TEST'&&r.action==='نسخ احتياطي على السيرفر'),'audit result');
  globalThis.MasalBackupServer.create=async()=>({id:'QUEUED',status:'pending'});await app.backup();check(messages.at(-1).error,'pending is not success');
  globalThis.MasalBackupServer.create=async()=>{throw Error('server failure')};await app.backup();check(messages.at(-1).message==='server failure'&&!app.serverBackupBusy,'failure resets busy');
 });
 assert.equal(downloads,0);assert.deepEqual(errors,[]);console.log('PASS server backup label, disconnected state, busy guard, confirmed success, audit, failure and no downloads');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
