const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();await page.goto(require('url').pathToFileURL(path.resolve('masal.html')).href);await page.waitForFunction(()=>typeof app.go==='function');
 const paths=[...[5000,10000,25000].map(n=>`sample-orders/asiacell-${n}-TEST.txt`),'outputs/masal-import-test-formats-20260927/asiacell-15000-TEST.csv','outputs/masal-import-test-formats-20260927/asiacell-40000-TEST.xlsx'];
 const files=paths.map(p=>({name:path.basename(p),data:fs.readFileSync(p).toString('base64')}));
 const result=await page.evaluate(async files=>{
  app.currentUser=app.s.users.find(u=>u.role==='owner').id;
  const s=app.s,e=app.engine,c=s.importReferenceCatalog,a=s.agents.find(a=>a.active&&!a.parent),source=e.saveOrderSource({name:'مصدر تجربة الصيغ',provider:c.provider}),lines=[];
  for(const file of files){const bytes=Uint8Array.from(atob(file.data),x=>x.charCodeAt(0));const parsed=(await MasalOrderParser.read(new File([bytes],file.name)))[0];const product=e.resolveOrderProduct(c.provider,parsed.categoryCode)[0];if(!product)throw Error(JSON.stringify(parsed));a.allowedProductIds.push(product.id);s.prices.push({id:'TEST-PRICE-'+product.id,agent:a.id,product:product.id,price:100,effective:Masal.day(),region:'الكل'});lines.push({...parsed,id:Masal.id('TEST-FILE'),product:product.id,cost:50,expenses:0});}
  const draft={key:Masal.id('TEST-FORMATS'),agent:a.id,provider:c.provider,sourceId:source.id,city:a.city,categoryCount:5,lines};const checked=e.checkMultiOrder(draft),order=e.submitMultiOrder(draft);e.reviewMultiOrder(order.id,'approve');e.reviewMultiOrder(order.id,'approve');
  return {valid:checked.quantity,rejected:checked.rejected,codes:lines.map(l=>l.categoryCode),counts:order.lines.map(l=>s.cards.filter(card=>card.batch===l.batch&&card.product===l.product&&card.agent===a.id).length),uniquePins:new Set(lines.flatMap(l=>l.rows.map(r=>r.pin))).size,total:s.cards.filter(card=>order.batches.includes(card.batch)).length};
 },files);
 assert.deepEqual(result,{valid:50,rejected:0,codes:['E5K','E10K','E25K','E15K','E40K'],counts:[10,10,10,10,10],uniquePins:50,total:50});console.log('PASS',JSON.stringify(result));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
