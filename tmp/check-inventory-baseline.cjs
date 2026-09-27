const fs=require('node:fs');
const moduleSource=fs.readFileSync('inventory-management.js','utf8').replace(/<\/script/gi,'<\\/script');
const baselineHTML=fs.readFileSync('masal.html','utf8').replace('<script>'+moduleSource+'</script>','').replace('MasalInventoryManagement.install(appOptions);','');
let test=fs.readFileSync('test-audit-fixes.cjs','utf8');
test=test.replace("await page.goto('file:///'+path.resolve('masal.html').replaceAll('\\\\','/'));", "await page.route('http://127.0.0.1:18881/**',route=>route.fulfill({contentType:'text/html',body:baselineHTML}));await page.goto('http://127.0.0.1:18881/');");
eval(test);
