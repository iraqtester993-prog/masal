/* Creates a standalone, fully offline HTML from the editable Vue application. */
const fs=require('node:fs');
let html=fs.readFileSync('index.html','utf8');
html=html.replace('<link rel="stylesheet" href="network-tree.css">','');
html=html.replace('<link rel="stylesheet" href="operations.css">','');
html=html.replace('<link rel="stylesheet" href="reference-identity.css">','');
let css=fs.readFileSync('styles.css','utf8')+'\n'+fs.readFileSync('operations.css','utf8')+'\n'+fs.readFileSync('theme.css','utf8')+'\n'+fs.readFileSync('layout.css','utf8')+'\n'+fs.readFileSync('polish.css','utf8')+'\n'+fs.readFileSync('management.css','utf8')+'\n'+fs.readFileSync('network-tree.css','utf8')+'\n'+fs.readFileSync('reference-identity.css','utf8');
html=html.replace('<link rel="stylesheet" href="management.css">','');
html=html.replace('<link rel="stylesheet" href="theme.css">','').replace('<link rel="stylesheet" href="layout.css">','').replace('<link rel="stylesheet" href="polish.css">','');
for(const file of ['cairo-regular.ttf','cairo-bold.ttf','cairo-black.ttf','jetbrains-mono.ttf'])css=css.replaceAll('assets/'+file,'data:font/ttf;base64,'+fs.readFileSync('assets/'+file).toString('base64'));
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>');
for(const file of ['assets/vue.global.prod.js','access.js','card-fields.js','engine.js','operations-engine.js','import-reader.js','operations-ui.js','workflow-engine.js','workflow-ui.js','completion-engine.js','completion-ui.js','locales.js','management-locales.js','operations-locales.js','completion-locales.js','reports.js','enhancements.js','staff-model.js','staff-ui.js','network-tree.js','audit-details.js','network-accounts.js','support-routing.js','simple-notifications.js','form-lifecycle.js','login-screen.js','visual-cleanup.js','excel-export.js','feature-updates.js','dashboard.js','meeting-rules.js','meeting-ui.js','categories-ui.js','regions.js','company-site.js','card-layout.js','providers-ui.js','inventory-ui.js','wallet-filters.js','searchable-selects.js','cash-orders.js','table-pagination.js','seller-accounts.js','print-escalation.js','funding-rules.js','audit-fixes.js','app.js']){const source=fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script');html=html.replace('<script src="'+file+'"></script>',()=>'<script>'+source+'</script>');}
fs.writeFileSync('masal.html',html,'utf8');console.log('Built standalone masal.html ('+Math.round(Buffer.byteLength(html)/1024)+' KB)');


