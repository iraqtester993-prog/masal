require('./setup.cjs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1366,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('node:url').pathToFileURL(require('node:path').resolve('masal.html')).href);await page.waitForFunction(()=>window.app);
 await page.evaluate(async()=>{app.s=Masal.seed();MasalOperations.initialize(app.s);app.currentUser='U1';app.loginScreen=false;app.switchUser();app.go('notifications');await Vue.nextTick();app.locationReady=true;});
 await page.getByLabel('عنوان الإشعار العربي',{exact:true}).fill('عنوان تجريبي');await page.getByLabel('نص الإشعار العربي',{exact:true}).fill('رسالة عربية');
 await page.getByLabel('English title',{exact:true}).fill('English title test');await page.getByLabel('English text',{exact:true}).fill('English message test');
 await page.getByLabel('کوردی title',{exact:true}).fill('ناونیشانی تاقیکردنەوە');await page.getByLabel('کوردی text',{exact:true}).fill('پەیامی کوردی');
 await page.evaluate(()=>app.sendNotification());
 const result=await page.evaluate(()=>{const n=app.s.notifications[0];window.testNoticeId=n.id;return {count:app.s.notifications.filter(x=>x.id===n.id).length,translations:n.translations,recipients:n.recipientUsers.length,reset:app.notificationForm.translations.en.title};});
 assert.equal(result.count,1);assert.ok(result.recipients>0);assert.equal(result.translations.ckb.body,'پەیامی کوردی');assert.equal(result.reset,'');
 for(const [lang,body] of [['ar','رسالة عربية'],['en','English message test'],['ckb','پەیامی کوردی']]){await page.evaluate(async lang=>{app.lang=lang;await Vue.nextTick();},lang);assert.ok(await page.getByText(body,{exact:true}).isVisible());}
 await page.evaluate(async()=>{const n=app.s.notifications.find(n=>n.id===testNoticeId);app.currentUser=n.recipientUsers[0];await Vue.nextTick();app.locationReady=true;app.go('notifications');app.openNotice(n);await Vue.nextTick();});
 assert.equal(await page.locator('.notice-detail-body').innerText(),'پەیامی کوردی');
 await page.evaluate(async()=>{app.lang='en';await Vue.nextTick();});assert.equal(await page.locator('.notice-detail-body').innerText(),'English message test');
 await page.evaluate(()=>{const check=(v)=>{if(!v)throw Error('fallback/validation failed')};const e=new Masal.Engine(app.s,'U1');const n=e.sendNotice({title:'قديم',body:'نص'},'all',[]);check(MasalSimpleNotifications.localized(n,'en').body==='نص');check(MasalSimpleNotifications.localized({title:'legacy',body:'old'},'ckb').body==='old');const before=app.s.notifications.length;let denied=false;try{e.sendNotice({title:'ع',body:'ن',translations:{en:{title:'partial'}}},'all',[])}catch{denied=true}check(denied&&before===app.s.notifications.length);});
 assert.deepEqual(errors,[]);console.log('PASS multilingual compose, single notice, recipient language, live detail switching, Arabic fallback, legacy and partial translation validation');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
