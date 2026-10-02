import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {readFile} from 'node:fs/promises'
const base='http://127.0.0.1:4181/direct-store-demo/api/index.php'
let cookie=''
async function call(action,body,customer,admin=true){const response=await fetch(base+'?action='+action,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(admin&&cookie?{Cookie:cookie}:{}),...(customer?{'X-Demo-Customer':customer}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});if(admin&&response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return {status:response.status,data:await response.json()}}
assert.equal((await call('image-upload',{image:'data:image/png;base64,AAAA'},undefined,false)).status,401)
assert.equal((await call('login',{username:'admin',password:'123456789'})).status,200)
assert.equal((await call('image-upload',{image:'data:image/svg+xml;base64,AAAA'})).status,422)
const bytes=await readFile('public/icon-recharge-192.png')
const image=(await call('image-upload',{image:'data:image/png;base64,'+bytes.toString('base64')})).data.image
assert.match(image,/^media\/[a-f0-9]{32}\.png$/)
assert.equal((await fetch('http://127.0.0.1:4181/direct-store-demo/'+image)).status,200)
const state=(await call('admin-state')).data,original=state.settings
assert.equal((await call('settings-save',{slides:[{title:'عنوان تجريبي',image},{title:'إعلان نصي',image:''}]})).status,200)
assert.equal((await call('catalog')).data.settings.slides.length,2)
assert.equal((await call('settings-save',{slides:[{title:'',image:''}]})).status,422)
await call('settings-save',{...original,slides:original.slides||[]})
const name='فحص التفاصيل '+Date.now(),company=state.companies[0]
assert.equal((await call('product-save',{companyId:company.id,name,face:5,currency:'USD',price:6000,cost:4000,image,kind:'دولية',min:5000,dailyQty:1,allowedCities:['بغداد'],fieldPolicy:{serial:'required'},receiptHeader:'دنارير',extraFields:[{label:'كود الخدمة',required:false}],active:true})).status,200)
let product=(await call('admin-state')).data.products.find(p=>p.name===name)
assert.equal(product.image,image);assert.equal(product.currency,'USD');assert.equal(product.fieldPolicy.pin,'required');assert.equal(product.fieldPolicy.serial,'required')
assert.equal((await call('product-save',{...product,price:100})).status,422)
assert.equal((await call('import',{productId:product.id,codes:'DEMO-FEATURE-'+Date.now()+'\nDEMO-FEATURE-B-'+Date.now(),supplier:'مجهز',source:'مصدر',city:'بغداد',reference:'QA',unitCost:4000,filename:'demo.txt'})).status,200)
const stockBefore=(await call('admin-state')).data.products.find(p=>p.id===product.id).stock
const duplicate='DEMO-MULTI-'+Date.now()
assert.equal((await call('import',{categoryCount:1,lines:[{productId:product.id,codes:duplicate},{productId:product.id,codes:duplicate}]})).status,422)
assert.equal((await call('admin-state')).data.products.find(p=>p.id===product.id).stock,stockBefore,'failed multi-file import must leave stock unchanged')
assert.equal((await call('import',{categoryCount:2,lines:[{productId:product.id,codes:duplicate}]})).status,422)
assert.equal((await call('import',{categoryCount:1,source:'مصدر',city:'بغداد',lines:[{productId:product.id,codes:duplicate,unitCost:3000,filename:'one.txt'},{productId:product.id,codes:duplicate+'-B',unitCost:4000,filename:'two.txt'}]})).status,200)
const batches=(await call('admin-state')).data.batches.slice(-2)
assert.equal(batches[0].orderId,batches[1].orderId)
assert.equal(batches[0].filename,'one.txt')
const buyer=randomUUID(),other=randomUUID()
const order={productId:product.id,quantity:1,expectedPrice:6000,requestId:randomUUID()}
assert.equal((await call('purchase',order,buyer)).status,422,'city required for restricted product')
assert.equal((await call('purchase',{...order,city:'بغداد'},buyer)).status,200)
assert.equal((await call('purchase',{...order,city:'بغداد',requestId:randomUUID()},buyer)).status,422,'daily quantity enforced')
assert.equal((await call('support-send',{subject:'فحص الدعم',message:'رسالة تجريبية'},buyer)).status,200)
let tickets=(await call('my-support',undefined,buyer)).data.tickets,ticket=tickets[0]
assert.equal(ticket.messages[0].text,'رسالة تجريبية');assert(!('customer' in ticket))
assert.equal((await call('my-support',undefined,other)).data.tickets.length,0)
assert.equal((await call('support-send',{id:ticket.id,message:'محاولة'},other)).status,404)
assert.equal((await call('support-reply',{id:ticket.id,message:'رد تجريبي'},undefined,false)).status,401)
assert.equal((await call('support-reply',{id:ticket.id,message:'رد تجريبي'})).status,200)
ticket=(await call('my-support',undefined,buyer)).data.tickets[0]
assert.equal(ticket.messages[1].text,'رد تجريبي');assert.equal(ticket.status,'replied')
assert.equal((await call('support-status',{id:ticket.id,status:'closed'})).status,200)
assert.equal((await call('support-send',{id:ticket.id,message:'رسالة جديدة'},buyer)).status,422)
await call('product-toggle',{id:product.id})
console.log('PASS: protected image upload, image persistence, sliders, Masal fields, minimum price, city scope, daily limits, support ownership, replies, closure')
