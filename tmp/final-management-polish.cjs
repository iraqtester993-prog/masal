const fs=require('fs');let h=fs.readFileSync('index.html','utf8');
h=h.replace('{{tr(money(r.value))}}',"{{can('data.cost')?tr(money(r.value)):'••••'}}");
h=h.replace('class="card permission-module" open',`class="card permission-module" :open="['dashboard','reports'].includes(group.module)||!!permissionSearch||permissionMode!=='all'"`);
fs.writeFileSync('index.html',h);
