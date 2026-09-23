const fs=require('fs');let h=fs.readFileSync('index.html','utf8');
h=h.replaceAll('v-if="actor.role===\'owner\'" class="btn small"','v-if="can(\'wallets.deposit\')" class="btn small"').replace('v-if="actor.role===\'owner\'" value="all"','v-if="can(\'notifications.broadcast\')" value="all"');
for(const key of ['velocity','expiryDays','providerDaily','reprint','minVersion','idle','blockedIPs'])h=h.replace('v-model'+(['minVersion','blockedIPs'].includes(key)?'':'.number')+'="settingsDraft.'+key+'"',':disabled="!can(\'security.'+key+'\')" v-model'+(['minVersion','blockedIPs'].includes(key)?'':'.number')+'="settingsDraft.'+key+'"');
fs.writeFileSync('index.html',h);
let a=fs.readFileSync('app.js','utf8');a=a.replace('async exportEncrypted(){try{','async exportEncrypted(){const exportActor=this.currentUser;try{');a=a.replace("cards.forEach(c=>c.status='Exported');", "if(exportActor!==this.currentUser)throw Error('تغير المستخدم أثناء التصدير');this.engine.requirePermission('exports.encrypt',b.agent);this.engine.requirePermission('data.pin');cards.forEach(c=>c.status='Exported');");
fs.writeFileSync('app.js',a);
