import assert from 'node:assert/strict'
const url='http://127.0.0.1:4181/direct-store-demo/api/index.php';let cookie='';
async function call(action,body){const r=await fetch(url+'?action='+action,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}
await call('login',{username:'admin',password:'123456789'});const state=(await call('admin-state')).data;const original=state.settings;
try {
assert.equal((await call('settings-save',{slides:[{id:'qa-first',title:'الأول',description:'وصف الأول',link:'https://our-qiq.com/direct-store-demo/'},{id:'qa-second',title:'الثاني'}]})).status,200);
assert.equal((await call('slide-save',{id:'qa-second',title:'الثاني المعدل',description:'وصف جديد',link:'https://our-qiq.com/direct-store-demo/dashboard/'})).status,200);
const slides=(await call('catalog')).data.settings.slides;assert.equal(slides[0].description,'وصف الأول');assert.equal(slides[1].title,'الثاني المعدل');assert.equal(slides[1].link,'https://our-qiq.com/direct-store-demo/dashboard/');
for(const link of ['javascript:alert(1)','data:text/html,test','https://user:password@example.com/'])assert.equal((await call('slide-save',{id:'qa-second',title:'رفض رابط',link})).status,422);
const section={id:'qa-section',title:'الأكثر تميزًا',selection:'manual',productIds:[state.products[0].id],active:true};assert.equal((await call('settings-save',{sections:[section]})).status,200);assert.deepEqual((await call('catalog')).data.settings.sections[0].productIds,section.productIds);
assert.equal((await call('settings-save',{sections:[{...section,title:''}]})).status,422);assert.equal((await call('settings-save',{sections:[section,section]})).status,422);
console.log('PASS: independent ads, descriptions, optional links, unsafe URL rejection, manual sections, invalid section rejection');
} finally {assert.equal((await call('settings-save',{...original,slides:original.slides||[],sections:original.sections||[{id:'featured-default',title:'الأكثر تميزًا',selection:'featured',active:true}]})).status,200)}
