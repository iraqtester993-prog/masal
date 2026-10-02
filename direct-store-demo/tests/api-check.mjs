import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
const base = process.env.DEMO_TEST_URL || 'http://127.0.0.1:4180/api/index.php'
assert(new URL(base).hostname === '127.0.0.1', 'Mutation tests run only against the isolated local demo')
let cookie = ''
async function call(action, body, customer, useCookie = true) {
  const res = await fetch(base + '?action=' + action, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(useCookie && cookie ? { Cookie: cookie } : {}), ...(customer ? { 'X-Demo-Customer': customer } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  if (res.headers.get('set-cookie') && useCookie) cookie = res.headers.get('set-cookie').split(';')[0]
  return { status: res.status, data: await res.json() }
}
const guest = await call('admin-state', undefined, undefined, false)
assert.equal(guest.status, 401)
assert.equal((await call('login', {username:'wrong',password:'123456789'})).status,401)
assert.equal((await call('login', {password:'dananeer-demo'})).status,401)
assert.equal((await call('login', { username: 'admin', password: '123456789' })).status, 200)
const catalog = (await call('catalog')).data
assert(catalog.products.length > 0)
assert(!('cost' in catalog.products[0]), 'Customer catalog must not expose costs')
const name = 'شركة فحص ' + Date.now()
assert.equal((await call('company-save', { name, symbol: 'QA', color: '#7255aa', type: 'خدمات', active: true })).status, 200)
let state = (await call('admin-state')).data
let company = state.companies.find(c => c.name === name)
assert((await call('catalog')).data.companies.some(c => c.id === company.id), 'Company changes propagate through server')
assert.equal((await call('product-save', { companyId: company.id, name: 'فئة فحص', face: 5000, price: 5500, cost: 4500, active: true, featured: true })).status, 200)
state = (await call('admin-state')).data
const product = state.products.find(p => p.companyId === company.id)
assert.equal(product.stock, 0)
assert.equal((await call('import', { productId: product.id, codes: 'DEMO-DUPLICATE\nDEMO-DUPLICATE' })).status, 422)
assert.equal((await call('import', { productId: product.id, codes: 'REAL-123456' })).status, 422)
assert.equal((await call('import', { productId: product.id, codes: 'DEMO-QA-' + Date.now() })).status, 200)
const buyer = randomUUID(), requestId = randomUUID()
assert.equal((await call('purchase', { productId: product.id, quantity: 1, expectedPrice: 1, requestId }, buyer)).status, 409)
const body = { productId: product.id, quantity: 1, expectedPrice: 5500, requestId }
const paid = await call('purchase', body, buyer)
assert.equal(paid.status, 200)
assert.equal(paid.data.order.total, 5500)
const repeated = await call('purchase', body, buyer)
assert.equal(repeated.data.order.id, paid.data.order.id, 'Retries must not create a second order')
assert.equal((await call('purchase', { ...body, requestId: randomUUID() }, randomUUID())).status, 422, 'Last card cannot be sold twice')
assert.equal((await call('my-orders', undefined, buyer)).data.orders.filter(o => o.id === paid.data.order.id).length, 1)
assert.equal((await call('my-orders', undefined, randomUUID())).data.orders.length, 0, 'Orders isolated between demo customers')
assert.equal((await call('product-toggle', { id: product.id })).status, 200)
assert(!(await call('catalog')).data.products.some(p => p.id === product.id), 'Hidden category removed from customer catalog')
await call('company-save', { ...company, active: false })
assert(!(await call('catalog')).data.companies.some(c => c.id === company.id))
await call('logout', {})
assert.equal((await call('product-toggle', { id: product.id })).status, 401)
console.log('PASS: shared catalog, protected admin, import validation, price validation, purchase retry, stock, order isolation, visibility, logout')

