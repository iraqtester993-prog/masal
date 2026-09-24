const fs=require('fs');function edit(file,fn){fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')))}
edit('index.html',s=>s.replace('<script src="app.js"></script>','<script src="money-inputs.js"></script><script src="app.js"></script>'));
edit('build.cjs',s=>s.replace("'audit-fixes.js','app.js'","'audit-fixes.js','money-inputs.js','app.js'"));
edit('app.js',s=>s.replace("window.app=createApp(appOptions)","MasalMoneyInputs.install(appOptions);\nwindow.app=createApp(appOptions)"));
edit('access.js',s=>s.replace('function can(user,key,state){',"function can(user,key,state){\n if(['wallets.bulk','wallets.transfer','wallets.approve','wallets.import'].includes(key)&&managementRole(state,user)==='pos')return false;"));
edit('operations-ui.js',s=>s.replace("{id:'bulk',name:'تمويل متعدد'},","...(can('wallets.bulk')?[{id:'bulk',name:'تمويل متعدد'}]:[]),"));
// Final templates are amended after all module overrides, including previews and forced tab navigation.
edit('app.js',s=>s.replace('MasalMoneyInputs.install(appOptions);',`for(const component of Object.values(appOptions.components||{})){if(component.template)component.template=component.template.replaceAll("tab==='bulk'", "tab==='bulk'&&can('wallets.bulk')").replaceAll('v-if="fundingPreview"', 'v-if="fundingPreview&&can(\\'wallets.bulk\\')"');}
MasalMoneyInputs.install(appOptions);`));
