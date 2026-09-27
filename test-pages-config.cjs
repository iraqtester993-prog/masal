const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
assert(fs.existsSync('.nojekyll'),'Pages must bypass Jekyll');
assert.equal(fs.statSync('.nojekyll').size,0);
const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).split(/\r?\n/);
assert(!tracked.some(p=>p.includes('/node_modules/')),'Tool dependencies still tracked');
for(const file of ['index.html','masal.html','decrypt.html']){
 const source=fs.readFileSync(file,'utf8');
 const references=[...source.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"{}]+)"/g)].map(m=>m[1]).filter(p=>!p.startsWith('data:')&&!/^https?:/.test(p));
 for(const ref of references)assert(fs.existsSync(path.resolve(path.dirname(file),ref.split('?')[0])),'Missing local dependency: '+ref);
}
assert(fs.existsSync('outputs/masal-import-test-formats-20260927/node_modules'));
console.log('PASS .nojekyll, no tracked tool dependencies, preserved local tools, all site script/style references resolve');
