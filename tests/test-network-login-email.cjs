require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await p.locator('#login-name').fill('admin');await p.locator('#login-password').fill('123456789');await p.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await p.waitForFunction(()=>!app.loginScreen);
 for(const [kind,id]of [['agents','DEMO-MAIN'],['agents','DEMO-BRANCH'],['agents','DEMO-SUBBRANCH'],['pos','DEMO-POS1']]){
  const email=id.toLowerCase()+'@example.test';
  await p.evaluate(({kind,id,email})=>{app.closeModal();const r=app.s[kind].find(r=>r.id===id);r.email='contact@example.test';MasalNetworkAccounts.linked(app.s,kind,id).email=email;app.go(kind);app.openEdit(r)},{kind,id,email});
  const field=p.locator('.modal').getByLabel('بريد تسجيل الدخول',{exact:true});await field.waitFor();assert.equal(await field.inputValue(),email);assert.equal(await field.getAttribute('readonly'),'');
  await p.evaluate(({kind,id})=>{app.closeModal();app.showNetworkDetails(kind,id)},{kind,id});assert.equal(await p.evaluate(()=>app.modal.data['بريد تسجيل الدخول']),email);assert.ok((await p.locator('.modal').innerText()).includes(email));
 }
 assert.deepEqual(errors,[]);console.log('PASS login email visible read-only in edit and details for main agent, branch, subbranch and POS');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
