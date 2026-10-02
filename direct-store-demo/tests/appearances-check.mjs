import assert from 'node:assert/strict'
const base='http://127.0.0.1:4181/direct-store-demo/api/index.php';let cookie=''
async function call(action,body,auth=true){const r=await fetch(base+'?action='+action,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}
assert.equal((await call('appearance-save',{appearanceStyle:'G'},false)).status,401)
assert.equal((await call('login',{username:'admin',password:'123456789'})).status,200)
const before=(await call('admin-state')).data
try{
 for(const appearanceStyle of ['G','H','J','K','L','M']){
  assert.equal((await call('appearance-save',{appearanceStyle})).status,200)
  assert.equal((await call('catalog')).data.settings.appearanceStyle,appearanceStyle)
 }
 assert.equal((await call('appearance-save',{appearanceStyle:'INVALID'})).status,422)
 assert.equal((await call('catalog')).data.settings.appearanceStyle,'M')
 const after=(await call('admin-state')).data
 assert.deepEqual(after.products,before.products);assert.deepEqual(after.orders,before.orders);assert.deepEqual(after.companies,before.companies)
 const settings={...after.settings};delete settings.appearanceStyle
 const originalSettings={...before.settings};delete originalSettings.appearanceStyle
 assert.deepEqual(settings,originalSettings,'appearance update preserves all other settings')
 await call('settings-save',{heroTitle:before.settings.heroTitle})
 assert.equal((await call('catalog')).data.settings.appearanceStyle,'M','content save preserves selected appearance')
 console.log('PASS: protected appearance save, six styles published to catalog, invalid choice rejected, content and stock unchanged')
}finally{await call('appearance-save',{appearanceStyle:before.settings.appearanceStyle||'G'})}
