const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(require('path').resolve('masal.html')).href);await page.waitForFunction(()=>typeof app.go==='function');
 const checks=await page.evaluate(()=>{
  const initial=app.currentUser,results=[];
  for(const u of app.s.users.filter(u=>u.active)){
   app.currentUser=u.id;const expected=NAV.flatMap(g=>g.items).filter(n=>app.can(n.id+'.view')&&!['sales','audit','monitoring'].includes(n.id)).map(n=>n.id);
   if(app.can('company.edit')&&(u.role==='owner'||u.staffAccount==='@system'))expected.push('company-settings');
   const actual=app.navGroups.flatMap(g=>g.items).map(n=>n.id);
   results.push({role:u.role,expected:expected.sort(),actual:actual.sort(),unique:new Set(actual).size===actual.length});
  }
  app.currentUser=initial;app.loginScreen=false;app.sidebarCollapsed=false;return results;
 });
 for(const r of checks){assert.deepEqual(r.actual,r.expected,r.role);assert.ok(r.unique)}
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>{app.theme=theme;document.documentElement.dataset.theme=theme;app.go('inventory')},theme);
  assert.equal(await page.locator('.nav-section:not(.direct-section).is-open').count(),1);
  await page.getByRole('button',{name:'المستخدمون والصلاحيات',exact:true}).click();
  assert.equal(await page.locator('.nav-section:not(.direct-section).is-open').count(),1);
  await page.getByRole('button',{name:'أوقات صلاحية الحساب',exact:true}).waitFor({state:'visible'});
  await page.evaluate(()=>app.go('support'));
  assert.equal(await page.getByRole('button',{name:'التواصل والدعم',exact:true}).getAttribute('aria-expanded'),'true');
 }
 await page.screenshot({path:'output/previews/sidebar-regrouped.png',animations:'disabled'});
 assert.deepEqual(errors,[]);console.log('PASS all existing destinations preserved across '+checks.length+' accounts; grouped navigation and accordion in both themes');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
