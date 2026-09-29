const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
let count=0;
for(const file of ['index.html','masal.html','decrypt.html']){
 const source=fs.readFileSync(file,'utf8');
 const refs=[...source.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"{}]+)"/g)].map(m=>m[1]).filter(p=>!p.startsWith('data:')&&!/^https?:/.test(p));
 for(const ref of refs){assert(fs.existsSync(path.resolve(path.dirname(file),ref.split('?')[0])),file+': missing '+ref);count++}
 if(file==='masal.html')assert.equal(refs.length,0,'Standalone must embed scripts and styles');
}
assert(fs.existsSync('.nojekyll'),'Keep GitHub Pages static entry');
for(const dir of ['src/js','src/css','assets','docs','tests','tools','samples'])assert(fs.statSync(dir).isDirectory());
assert.equal(fs.readdirSync('.').filter(n=>/\.(js|css|cjs)$/.test(n)).length,0,'Source and build files must not clutter root');
for(const file of fs.readdirSync('src/css')){
 const name=path.join('src/css',file),css=fs.readFileSync(name,'utf8');
 for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  const ref=match[1];if(/^(data:|https?:|#)/.test(ref))continue;
  assert(fs.existsSync(path.resolve(path.dirname(name),ref)),'Missing CSS asset: '+name+' -> '+ref);
 }
}
assert.equal(fs.readdirSync('.').filter(n=>/^test-.*\.cjs$/.test(n)).length,0,'Tests should be under tests/');
console.log('PASS project structure, '+count+' local references, standalone bundle and Pages marker');
