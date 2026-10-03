require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const inspectLayout=async role=>{for(const width of [1366,390])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:950});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const layout=await page.locator('.recovery-page').evaluate(el=>{const boxes=[...el.children].filter(n=>n.checkVisibility()).map(n=>n.getBoundingClientRect());return{gaps:boxes.slice(1).map((b,i)=>b.top-boxes[i].bottom),overflow:el.scrollWidth>el.clientWidth+2,text:el.textContent}});
  assert.ok(layout.gaps.every(g=>g>=15),`${role} ${width}: separated cards`);assert.equal(layout.overflow,false);assert.ok(!layout.text.includes('تُطبّق على التمويلات الجديدة'));
  if(width===1366)await page.locator('.recovery-page').screenshot({path:`tmp/review/recovery-${role}-${theme}.png`});
 }};
 await page.goto(require('node:url').pathToFileURL(require('node:path').resolve('masal.html')).href);
 await page.locator('#login-name').fill('admin');await page.locator('#login-password').fill('123456789');await page.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await page.waitForFunction(()=>!app.loginScreen);
 const result=await page.evaluate(async()=>{
  const s=Masal.seed();MasalOperations.initialize(s);const e=new Masal.Engine(s,'U3'),owner=new Masal.Engine(s,'U1');
  const check=(x,m)=>{if(!x)throw Error(m)},denied=fn=>{try{fn();return false}catch{return true}};
  owner.setFundingRecoveryHours(72);check(s.settings.fundingRecoveryHours===72,'72 hours accepted');check(denied(()=>e.setFundingRecoveryHours(5)),'owner only');
  for(const n of [0,-1,NaN,Infinity])check(denied(()=>owner.setFundingRecoveryHours(n)),'invalid duration');
  const t=e.fund('A1','A3',100,'voucher','WINDOW-1'),deadline=t.recoveryDeadline;
  check(Date.parse(deadline)-Date.parse(t.time)===72*3600000,'snapshot 72h');owner.setFundingRecoveryHours(48);check(t.recoveryDeadline===deadline,'existing deadline unchanged');
  const u=e.fund('A1','A3',50,'voucher','WINDOW-2');check(u.recoveryHours===48,'new policy');
  const before=e.serviceBalance('A1'),dest=e.serviceBalance('A3');
  e.recoverFunding('A1','A3',40,'voucher','جزئي','WINDOW-R',t.id);e.recoverFunding('A1','A3',40,'voucher','جزئي','WINDOW-R',t.id);
  check(e.serviceBalance('A1')===before+40&&e.serviceBalance('A3')===dest-40,'balanced and idempotent');
  const realNow=Date.now;try{Date.now=()=>Date.parse(t.recoveryDeadline);check(e.recoverableFunding('A1','A3','voucher',t.id)===0,'expiry boundary');check(denied(()=>e.recoverFunding('A1','A3',1,'voucher','متأخر','LATE',t.id)),'late blocked');check(denied(()=>e.reverseFunding(u.id,'متأخر')),'reverse blocked');}finally{Date.now=realNow}
  const missing={...t,id:'LEGACY-MISSING',key:'LEGACY-MISSING',time:null};delete missing.recoveryDeadline;delete missing.recoveryHours;s.fundingTransfers.push(missing);e.operations();check(!e.fundingRecoveryOpen(missing),'unknown date blocked');
  app.s=s;app.currentUser='U1';app.switchUser();app.go('wallets');await Vue.nextTick();app.$refs.operations.tab='recovery';await Vue.nextTick();return true;
 });assert.equal(result,true);
 const hours=page.getByLabel('مدة السماح باسترجاع الرصيد بالساعات');await hours.waitFor();assert.equal(await hours.getAttribute('max'),null);await hours.fill('96');await page.getByRole('button',{name:'حفظ المهلة',exact:true}).click();assert.equal(await page.evaluate(()=>app.s.settings.fundingRecoveryHours),96);
 await inspectLayout('owner');
 await page.evaluate(async()=>{app.currentUser='U3';app.switchUser();app.go('wallets');await Vue.nextTick();app.$refs.operations.tab='recovery';app.$refs.operations.service='voucher';await Vue.nextTick();app.$refs.operations.recovery.to='A3';});
 await page.getByLabel('عملية التمويل للاسترجاع').waitFor();assert.equal(await hours.count(),0);assert.deepEqual(errors,[]);
 await page.evaluate(async()=>{app.locationReady=true;await Vue.nextTick()});
 await inspectLayout('agent');
 console.log('PASS configurable >24h duration, owner-only policy, snapshots, partial balanced recovery, idempotency, expiry boundary, reversal guard, unknown dates, policy UI and transfer selector');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
