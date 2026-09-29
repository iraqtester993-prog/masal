require('./setup.cjs');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/PRO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=process.cwd(),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.geojson':'application/json'};
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!name.startsWith('/masal/')){res.writeHead(404).end();return}
  const file=path.resolve(root,name.slice(7)||'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const base='http://127.0.0.1:'+server.address().port+'/masal/';
  for(const url of [pathToFileURL(path.join(root,'masal.html')).href,pathToFileURL(path.join(root,'index.html')).href,base,base+'masal.html']){
   const context=await browser.newContext(),page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url())});
   await page.goto(url);await page.locator('#login-name').fill('admin');await page.locator('#login-password').fill('123456789');
   await page.getByRole('button',{name:'تسجيل الدخول',exact:false}).click();await page.waitForFunction(()=>!app.loginScreen);
   for(const route of ['dashboard','reports','wallets','support'])await page.evaluate(async r=>{app.go(r);await Vue.nextTick()},route);
   assert.deepEqual(errors,[],url);assert.deepEqual(missing,[],url);
   await context.close();console.log('PASS '+url);
  }
  const response=await fetch(base+'decrypt.html');assert.equal(response.status,200);assert.ok((await response.text()).includes('crypto.subtle'));
  console.log('PASS local and /masal/ static-site smoke checks, including decrypt page');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
