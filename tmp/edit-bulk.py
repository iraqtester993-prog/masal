from pathlib import Path
p=Path('audit-fixes.js');s=p.read_text(encoding='utf8')
s=s.replace("fundingSource:'',fundingHistory:null","fundingSource:'',fundingHistory:null,bulkSelected:[],bulkAmounts:{},bulkSearch:''",1)
anchor=' panel.methods.readBulk=async function(event)'
pos=s.index(anchor)
insert=''' panel.computed.bulkRecipients=function(){return this.accounts.filter(a=>a.id!==this.from&&a.active!==false&&this.e.descendants(this.from).includes(this.e.accountAgent(a.id)))};
 panel.computed.bulkVisibleRecipients=function(){const q=this.bulkSearch.trim().toLowerCase();return this.bulkRecipients.filter(a=>(a.name+' '+a.id+' '+(a.city||'')).toLowerCase().includes(q))};
 panel.methods.clearBulkSelection=function(){this.bulkSelected=[];this.bulkAmounts={};this.bulkSearch='';this.bulkText='';this.fundingPreview=null;this.bulkResult=[];this.newKey()};
 const oldFromWatcher=panel.watch.from;panel.watch.from=function(...args){this.clearBulkSelection();if(typeof oldFromWatcher==='function')oldFromWatcher.apply(this,args)};
 panel.watch.bulkSelected={deep:true,handler(){this.fundingPreview=null}};
 panel.watch.bulkAmounts={deep:true,handler(){this.fundingPreview=null}};
 panel.watch.bulkText=function(){this.fundingPreview=null};
 const oldServiceWatcher=panel.watch.service;panel.watch.service=function(...args){this.fundingPreview=null;if(typeof oldServiceWatcher==='function')oldServiceWatcher.apply(this,args)};
'''
s=s[:pos]+insert+s[pos:]
s=s.replace("this.bulkText=rows.map(r=>r.slice(0,4)","this.bulkSelected=[];this.bulkAmounts={};this.bulkText=rows.map(r=>r.slice(0,4)",1)
s=s.replace(":MasalImportReader.delimited(this.bulkText).map(r=>({from:this.from,to:r[0],amount:Number(r[1]),service:r[2]||this.service,reference:r[3]||''}));",":this.bulkSelected.length?this.bulkSelected.map(to=>{if(!this.bulkRecipients.some(a=>a.id===to))throw Error('المستفيد لم يعد ضمن الجهات المسموح تمويلها');return {from:this.from,to,amount:Number(this.bulkAmounts[to]),service:this.service,reference:''}}):MasalImportReader.delimited(this.bulkText).map(r=>({from:this.from,to:r[0],amount:Number(r[1]),service:r[2]||this.service,reference:r[3]||''}));",1)
s=s.replace("this.fundSelected=[];this.fundingPreview=null;this.bulkText='';this.newKey();","this.fundSelected=[];this.fundingPreview=null;this.bulkText='';this.bulkSelected=[];this.bulkAmounts={};this.newKey();",1)
s=s.replace("this.fundingPreview=null;return reset.apply(this,args)","this.clearBulkSelection();return reset.apply(this,args)",1)
anchor=" panel.template=panel.template.replace('استيراد المستفيد والمبلغ من Excel أو CSV'"
pos=s.index(anchor)
insert=''' panel.template=panel.template.replace('<label>{{vm.tr("استيراد المستفيد والمبلغ من Excel أو CSV")}}',`<label>بحث باسم المستفيد<input v-model="bulkSearch" placeholder="اسم النقطة أو الوكيل أو المحافظة"></label><p class="help">حدد المستفيدين وأدخل مبلغ كل واحد، ثم اضغط معاينة المجموعة. المحفظة المستخدمة: {{serviceName(service)}}.</p><div class="tablewrap" style="max-height:420px;overflow:auto"><table class="bulk-recipient-table"><thead><tr><th>اختيار</th><th>المستفيد</th><th>النوع</th><th>المبلغ • د.ع</th></tr></thead><tbody><tr v-for="a in bulkVisibleRecipients" :key="a.id"><td><input type="checkbox" v-model="bulkSelected" :value="a.id" :aria-label="'اختيار '+a.name" @change="bulkText='' "></td><td>{{a.name}}</td><td>{{s.pos.some(p=>p.id===a.id)?'نقطة بيع':a.type||'وكيل'}}</td><td><input type="number" min="0.01" step="0.01" v-model.number="bulkAmounts[a.id]" :disabled="!bulkSelected.includes(a.id)" :aria-label="'مبلغ '+a.name" placeholder="أدخل المبلغ"></td></tr><tr v-if="!bulkVisibleRecipients.length"><td colspan="4">لا توجد جهات مطابقة متاحة للتمويل.</td></tr></tbody></table></div><p>المستفيدون المحددون: {{bulkSelected.length}}</p><details><summary>استيراد قائمة من ملف — اختياري</summary><label>{{vm.tr("استيراد المستفيد والمبلغ من Excel أو CSV")}}`).replace('placeholder="POS1,25000&#10;A3,50000"></textarea>','placeholder="POS1,25000&#10;A3,50000" @input="bulkSelected=[]"></textarea></details>').replace('@click="newKey();bulkResult=[]"','@click="clearBulkSelection"');
'''
s=s[:pos]+insert+s[pos:];p.write_text(s,encoding='utf8')
