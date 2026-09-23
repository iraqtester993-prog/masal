const fs=require('fs'),source=require('./review/translation-pending.json');const rows=fs.readFileSync('review/operations-translations.txt','utf8').trim().split(/\r?\n/),entries={};
for(const row of rows){const [index,en,ckb]=row.split('|');if(!source[+index]||!en||!ckb)throw Error('Invalid translation row '+row);entries[source[+index]]={en,ckb};}if(Object.keys(entries).length!==source.length)throw Error('Missing translations');
fs.writeFileSync('operations-locales.js','(function(){const entries='+JSON.stringify(entries)+';for(const [ar,v] of Object.entries(entries))for(const lang of ["en","ckb"])MasalLocale.dictionaries[lang][ar]=v[lang];})();\n');
function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}
edit('index.html',s=>s.replace('<script src="management-locales.js"></script>','<script src="management-locales.js"></script><script src="operations-locales.js"></script><script src="completion-locales.js"></script>'));
edit('build.cjs',s=>s.replace("'management-locales.js','reports.js'","'management-locales.js','operations-locales.js','completion-locales.js','reports.js'"));
for(const file of ['operations-ui.js','workflow-ui.js'])edit(file,s=>{const start=s.indexOf('template:`'),end=s.indexOf('`',start+10);let html=s.slice(start+10,end);html=html.replace(/\{\{([\s\S]*?)\}\}/g,(match,expr)=>expr.startsWith('vm.tr(')?match:'{{vm.tr('+expr+')}}');return s.slice(0,start+10)+html+s.slice(end)});
console.log('Compiled '+rows.length+' operations translations for English and Kurdish');
