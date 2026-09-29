(function(root){
'use strict';
const P=Masal.Engine.prototype,round=v=>Math.round(Number(v)*100)/100;
function requireAgent(e,agent){e.requirePermission('prices.propose');e.require(agent);if(!e.s.agents.some(a=>a.id===agent&&a.active&&e.main(a.id)===a.id))throw Error('اختر وكيلًا رئيسيًا فعالًا ضمن نطاقك')}
P.previewPriceEdit=function(agent,changes){
 requireAgent(this,agent);if(!Array.isArray(changes)||!changes.length)throw Error('لا توجد فئات محددة للتعديل');
 const seen=new Set(),rows=changes.map(c=>{const p=this.s.products.find(p=>p.id===c.product);if(!p||seen.has(c.product))throw Error('فئة غير موجودة أو مكررة');seen.add(c.product);
 const price=Number(c.price),old=this.policyPrice(agent,p.id);let error='';
 if(!Number.isFinite(price)||price<=0||round(price)!==price)error='أدخل سعرًا موجبًا بمنزلتين عشريتين كحد أقصى';
 else if(price<Number(p.min||0))error='السعر أقل من الحد المسموح';
 if(c.requiresCurrent&&!(old>0))error='لا يوجد سعر حالي؛ حدده فرديًا أولًا';
 return {product:p.id,name:p.name,old,price,difference:round(price-old),error};
 });
 return {agent,user:this.user,key:Masal.id('PRICE-EDIT'),rows,valid:rows.every(r=>!r.error)&&rows.some(r=>r.price!==r.old)};
};
P.commitPriceEdit=function(preview){
 if(!preview||preview.user!==this.user||!preview.key)throw Error('تغير المستخدم؛ أعد المعاينة');requireAgent(this,preview.agent);
 const rows=preview.rows.map(r=>({product:r.product,price:r.price,old:r.old})),payload=JSON.stringify({agent:preview.agent,rows});
 const previous=this.s.priceRequests.find(r=>r.priceEditKey===preview.key);
 if(previous){if(previous.creator!==this.user||previous.priceEditPayload!==payload)throw Error('معرف المعاينة مستخدم لبيانات مختلفة');return previous}
 const checked=this.previewPriceEdit(preview.agent,rows);if(!checked.valid)throw Error(checked.rows.find(r=>r.error)?.error||'لا يوجد تغيير في الأسعار');
 if(checked.rows.some((r,i)=>r.old!==rows[i].old))throw Error('تغير أحد الأسعار منذ المعاينة؛ أعد المعاينة');
 return MasalMeetingRules.atomic(this,()=>{const r=this.proposePrices(checked.rows.filter(r=>r.old!==r.price).map(r=>({agent:preview.agent,product:r.product,price:r.price})));r.priceEditKey=preview.key;r.priceEditPayload=payload;return r});
};
const component={
 data:()=>({mode:'individual',previewMode:'individual',query:'',provider:'',scope:'filtered',direction:'add',amount:'',selected:[],preview:null,busy:false,error:''}),
 computed:{
  vm(){return this.$root},e(){return this.vm.engine},
  agents(){return this.vm.visibleAgents.filter(a=>a.active&&this.e.main(a.id)===a.id)},
  products(){const q=this.query.trim().toLowerCase();return this.vm.s.products.filter(p=>(!this.provider||p.provider===this.provider)&&(!q||(p.name+' '+(p.face??'')+' '+p.id).toLowerCase().includes(q)))},
  canEdit(){return this.vm.can('prices.propose')},
  draftCount(){return Object.values(this.vm.priceDraft).filter(v=>v!==''&&v!=null).length},
  targetIds(){return this.scope==='all'?this.vm.s.products.map(p=>p.id):this.scope==='selected'?this.selected:this.products.map(p=>p.id)}
 },
 mounted(){this.ensureAgent()},
 watch:{
  'vm.currentUser'(){this.clear();this.vm.priceDraft={};this.ensureAgent()},
  'vm.priceAgent'(){this.clear()},
  preview(value){if(value)this.$nextTick(()=>{const d=this.$refs.review;if(d&&!d.open){this._focus=document.activeElement;d.showModal();d.focus()}});else this.$nextTick(()=>this._focus?.isConnected&&this._focus.focus())}
 },
 methods:{
  ensureAgent(){if(!this.agents.some(a=>a.id===this.vm.priceAgent))this.vm.priceAgent=this.agents[0]?.id||''},
  clear(){this.preview=null;this.selected=[];this.amount='';this.error=''},
  close(){if(!this.busy)this.preview=null},
  async importFile(event){const user=this.vm.currentUser;await this.vm.importPrices(event);if(this.vm.currentUser===user)this.mode='individual'},
  switchMode(mode){if(this.busy||this.vm.priceImportBusy)return;this.mode=mode;this.error=''},
  prepare(mode){
   if(this.vm.priceImportBusy||this.busy)return;this.error='';
   try{let changes;
    if(mode==='bulk'){
     const delta=Number(this.amount);if(!Number.isFinite(delta)||delta<=0||round(delta)!==delta)throw Error('أدخل مبلغ زيادة أو نقصان موجبًا بمنزلتين عشريتين كحد أقصى');
     if(!['add','subtract'].includes(this.direction))throw Error('اختر زيادة أو نقصان');
     changes=this.targetIds.map(product=>({product,price:round(this.e.policyPrice(this.vm.priceAgent,product)+(this.direction==='add'?delta:-delta)),requiresCurrent:true}));
    }else changes=Object.entries(this.vm.priceDraft).filter(([,v])=>v!==''&&v!=null).map(([product,price])=>({product,price:Number(price)}));
    this.previewMode=mode==='bulk'?'bulk':'individual';this.preview=this.e.previewPriceEdit(this.vm.priceAgent,changes);
   }catch(e){this.error=e.message}
  },
  async confirm(){
   if(this.busy||!this.preview?.valid)return;this.busy=true;this.error='';
   try{if(this.preview.agent!==this.vm.priceAgent)throw Error('تغير الوكيل؛ أعد المعاينة');const result=this.e.commitPriceEdit(this.preview);if(this.previewMode==='individual')this.vm.priceDraft={};this.clear();this.vm.notify(result.status==='معتمد'?'تم تطبيق الأسعار':'أُرسلت الأسعار للاعتماد');this.vm.persist()}
   catch(e){this.error=e.message}finally{await this.$nextTick();this.busy=false}
  }
 },
 template:`<section class="card price-editor">
 <nav v-if="canEdit" class="price-mode-tabs" aria-label="طريقة تعديل الأسعار"><button type="button" class="btn" :class="{active:mode===\'individual\'}" :aria-pressed="mode===\'individual\'" :disabled="busy||vm.priceImportBusy" @click="switchMode(\'individual\')">تعديل سعر فئة</button><button type="button" class="btn" :class="{active:mode===\'bulk\'}" :aria-pressed="mode===\'bulk\'" :disabled="busy||vm.priceImportBusy" @click="switchMode(\'bulk\')">تعديل أسعار الفئات</button></nav>
 <div class="price-editor-toolbar">
 <label>قائمة أسعار الوكيل<select v-model="vm.priceAgent" aria-label="قائمة أسعار الوكيل"><option v-for="a in agents" :key="a.id" :value="a.id">{{a.name}}</option></select></label>
 <label>بحث عن فئة<input v-model="query" placeholder="اسم الفئة أو قيمتها" aria-label="بحث فئات الأسعار"></label>
 <label>الشركة<select v-model="provider" aria-label="فلترة شركة الفئات"><option value="">كل الشركات</option><option v-for="p in vm.s.providers" :key="p.id" :value="p.id">{{p.name}}</option></select></label>
 </div>
 <div v-if="canEdit&&mode==='bulk'" class="price-bulk-toolbar">
 <label>نطاق التعديل<select v-model="scope" aria-label="نطاق تعديل الأسعار"><option value="filtered">نتائج الفلترة</option><option value="all">كل الفئات</option><option value="selected">الفئات المحددة يدويًا</option></select></label>
 <label>نوع التعديل<select v-model="direction" aria-label="نوع تعديل الأسعار"><option value="add">زيادة مبلغ</option><option value="subtract">نقصان مبلغ</option></select></label>
 <label>المبلغ · د.ع<input type="number" min="0.01" step="0.01" v-model="amount" aria-label="مبلغ تعديل الأسعار"></label>
 <button class="btn primary" @click="prepare('bulk')" :disabled="busy||vm.priceImportBusy||!targetIds.length">معاينة التغييرات ({{targetIds.length}})</button>
 </div>
 <details class="price-extra"><summary>خيارات إضافية</summary><div class="actions"><button v-if="vm.can('prices.template')" class="btn" @click="vm.downloadPrices()">تنزيل قالب الأسعار</button><label v-if="vm.can('prices.import')" class="btn">{{vm.priceImportBusy?'جارٍ قراءة الأسعار':'استيراد Excel / CSV'}}<input type="file" accept=".csv,.xlsx" hidden :disabled="vm.priceImportBusy" @change="importFile($event)"></label></div></details>
 <p v-if="error&&!preview" class="notice warn" role="alert">{{error}}</p>
 <div class="tablewrap"><table class="price-edit-table"><thead><tr><th v-if="canEdit&&mode==='bulk'">تحديد</th><th>الفئة</th><th v-if="vm.can('data.cost')">أقل سعر مسموح</th><th>السعر الحالي</th><th v-if="canEdit&&mode==='individual'">السعر الجديد · د.ع</th></tr></thead><tbody>
 <tr v-for="p in products" :key="p.id"><td v-if="canEdit&&mode==='bulk'"><input type="checkbox" v-model="selected" :value="p.id" :aria-label="'تحديد '+p.name" @change="scope='selected'"></td><td>{{p.name}}</td><td v-if="vm.can('data.cost')">{{vm.money(p.min)}}</td><td>{{vm.money(e.policyPrice(vm.priceAgent,p.id))}}</td><td v-if="canEdit&&mode==='individual'"><input type="number" :min="Math.max(0.01,p.min||0)" step="0.01" v-model.number="vm.priceDraft[p.id]" :aria-label="'السعر الجديد '+p.name" placeholder="بدون تعديل"></td></tr>
 <tr v-if="!products.length"><td colspan="5" class="empty">لا توجد فئات مطابقة</td></tr></tbody></table></div>
 <div v-if="canEdit&&mode==='individual'" class="formfoot"><span>{{draftCount}} تعديلات فردية</span><button class="btn" @click="vm.priceDraft={}" :disabled="busy||vm.priceImportBusy">مسح التعديلات الفردية</button><button class="btn primary" @click="prepare('draft')" :disabled="!draftCount||busy||vm.priceImportBusy">معاينة التغييرات</button></div>
 <teleport to="body"><dialog v-if="preview" ref="review" class="funding-preview-dialog price-preview-dialog" aria-label="معاينة تعديل الأسعار" tabindex="-1" @cancel.prevent="close">
 <div class="support-section-heading"><h2>معاينة تعديل الأسعار</h2><button class="iconbtn" @click="close" :disabled="busy" aria-label="إغلاق معاينة الأسعار">×</button></div>
 <p>{{vm.nameOf('agents',preview.agent)}} · {{preview.rows.length}} فئات</p>
 <div class="tablewrap"><table><thead><tr><th>الفئة</th><th>السعر القديم</th><th>التغيير</th><th>السعر الجديد</th><th>الفحص</th></tr></thead><tbody><tr v-for="r in preview.rows" :key="r.product"><td>{{r.name}}</td><td>{{vm.money(r.old)}}</td><td dir="ltr">{{r.difference>0?'+':''}}{{vm.money(r.difference)}}</td><td>{{vm.money(r.price)}}</td><td>{{r.error||(r.price===r.old?'بدون تغيير':'صالح')}}</td></tr></tbody></table></div>
 <p v-if="error" role="alert" class="notice warn">{{error}}</p>
 <div class="actions"><button class="btn primary" :disabled="!preview.valid||busy" @click="confirm">{{['owner','main'].includes(vm.actor.role)?'حفظ الأسعار':'إرسال للاعتماد'}}</button><button class="btn" :disabled="busy" @click="close">رجوع للتعديل</button></div>
 </dialog></teleport></section>`
};
const history={
 data:()=>({query:'',state:'',from:'',to:''}),
 computed:{vm(){return this.$root},showActions(){return this.rows.some(c=>(c.request.status==='قيد المراجعة'&&this.vm.can('prices.approve'))||(c.request.status==='معتمد'&&this.vm.can('prices.reverse')))},rows(){const q=this.query.trim().toLowerCase();return this.vm.visiblePriceRequests.flatMap(r=>r.changes.map((c,i)=>({...c,key:r.id+'-'+i,request:r}))).filter(c=>(!this.vm.priceAgent||c.agent===this.vm.priceAgent)&&(!this.state||c.request.status===this.state)&&(!this.from||Masal.businessDay(c.request.time)>=this.from)&&(!this.to||Masal.businessDay(c.request.time)<=this.to)&&(!q||[c.request.id,this.vm.nameOf('products',c.product),this.vm.nameOf('agents',c.agent),this.vm.nameOf('users',c.request.creator)].join(' ').toLowerCase().includes(q))).sort((a,b)=>Date.parse(b.request.time)-Date.parse(a.request.time))}},
 template:`<section class="card price-history" style="margin-top:20px"><h3>سجل تغييرات الأسعار</h3><div class="toolbar"><input v-model="query" type="search" aria-label="بحث في سجل الأسعار" placeholder="بحث بالعملية أو الفئة أو المستخدم"><select v-model="state" aria-label="حالة تغيير السعر"><option value="">جميع الحالات</option><option>معتمد</option><option>قيد المراجعة</option><option>تم التراجع</option></select><label>من<input type="date" v-model="from" aria-label="سجل الأسعار من تاريخ"></label><label>إلى<input type="date" v-model="to" aria-label="سجل الأسعار إلى تاريخ"></label></div><div class="tablewrap"><table><thead><tr><th>رقم العملية</th><th>التاريخ والوقت</th><th>الوكيل</th><th>الفئة</th><th>السعر السابق · د.ع</th><th>السعر الجديد · د.ع</th><th>الفرق · د.ع</th><th>نفّذ التعديل</th><th>الحالة</th><th v-if="showActions">الإجراءات</th></tr></thead><tbody><tr v-for="c in rows" :key="c.key"><td class="mono">{{c.request.id}}</td><td>{{vm.formatTime(c.request.time)}}</td><td>{{vm.nameOf('agents',c.agent)}}</td><td>{{vm.nameOf('products',c.product)}}</td><td>{{c.old==null?'—':vm.money(c.old)}}</td><td>{{vm.money(c.price)}}</td><td dir="ltr">{{c.old==null?'—':vm.money(c.price-c.old)}}</td><td>{{vm.nameOf('users',c.request.creator)}}</td><td><span class="badge" :class="{warn:c.request.status==='قيد المراجعة',neutral:c.request.status!=='معتمد'}">{{c.request.status}}</span></td><td v-if="showActions"><div class="actions"><button v-if="c.request.status==='قيد المراجعة'&&vm.can('prices.approve')" class="btn small primary" @click="vm.approvePrices(c.request)">اعتماد</button><button v-if="c.request.status==='معتمد'&&vm.can('prices.reverse')" class="btn small" @click="vm.reversePrices(c.request)">تراجع</button><span v-if="!(c.request.status==='قيد المراجعة'&&vm.can('prices.approve'))&&!(c.request.status==='معتمد'&&vm.can('prices.reverse'))">—</span></div></td></tr><tr v-if="!rows.length"><td :colspan="showActions?10:9" class="empty">لا توجد تغييرات أسعار مطابقة</td></tr></tbody></table></div></section>`
};
function install(o){o.components['price-editor']=component;o.components['price-history']=history}
root.MasalPriceEditor={install};
})(globalThis);
