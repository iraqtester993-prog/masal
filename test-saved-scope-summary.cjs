const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await p.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);
  await p.locator('#login-name').fill('admin');await p.locator('#login-password').fill('123456789');
  await p.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await p.waitForFunction(()=>!app.loginScreen);
  await p.evaluate(()=>{
   app.s=Masal.seed();MasalOperations.initialize(app.s);app.currentUser='U1';
   const targets=[];
   for(let i=0;i<105;i++){const id='SCOPE-TEST-'+i;app.s.pos.push({...app.s.pos[0],id,name:'نقطة اختبار '+i});targets.push({kind:'pos',id})}
   app.s.printPolicyRules=[{id:'TEST',name:'نطاق تجريبي',targets,active:true,policy:{...app.engine.printPolicy('')}}];
   app.go('printPolicies');document.documentElement.dataset.theme='dark';
  });
  const cell=p.locator('.saved-scope-summary');await cell.waitFor();
  assert.match(await cell.innerText(),/105 نطاق/);assert.doesNotMatch(await cell.innerText(),/نقطة اختبار/);
  await cell.getByRole('button',{name:'عرض النطاق'}).click();
  const dialog=p.locator('dialog.saved-scope-dialog[open]');await dialog.waitFor();
  assert.equal(await dialog.locator('li').count(),20);
  await dialog.getByRole('button',{name:'التالي',exact:true}).click();assert.match(await dialog.locator('li').first().innerText(),/20/);
  await dialog.getByRole('searchbox').fill('نقطة اختبار 104');assert.equal(await dialog.locator('li').count(),1);
  await p.screenshot({path:'tmp/saved-scope-summary-dark.png'});
  await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await p.locator('dialog[open]').count(),0);
  await cell.getByRole('button',{name:'عرض النطاق'}).click();assert.equal(await dialog.locator('li').count(),20);
  await dialog.getByRole('button',{name:'إغلاق النطاقات'}).click();assert.deepEqual(errors,[]);
  console.log('PASS: 105 targets compact, 20/page, search, Escape, close and reopen');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
