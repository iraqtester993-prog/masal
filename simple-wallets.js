(function(root){
'use strict';
const M=root.Masal,P=M.Engine.prototype,now=()=>new Date().toISOString();
const own=e=>{const u=e.actor();return u.role==='owner'||u.staffAccount==='@system'?'@owner':u.role==='pos'?u.pos:u.staffAccount||u.agent||''};
const parent=(s,id)=>s.pos.find(p=>p.id===id)?.agent||s.agents.find(a=>a.id===id)?.parent||(s.agents.some(a=>a.id===id)?'@owner':'');
function amount(value){const n=Number(value);if(!Number.isFinite(n)||n<=0||Math.abs(n*100-Math.round(n*100))>0.000001)throw Error('أدخل مبلغًا موجبًا بمنزلتين عشريتين كحد أقصى');return n}
function service(e,id){if(!['voucher','topup','cash',...e.s.providers.filter(p=>p.connection==='API').map(p=>'api:'+p.id)].includes(id))throw Error('اختر محفظة صحيحة')}
function active(e,id){const a=e.s.agents.find(a=>a.id===id)||e.s.pos.find(p=>p.id===id);if(!a?.active)throw Error('الحساب غير موجود أو موقوف');e.accountCheck(id);return a}
function atomic(e,fn){const previous=e._walletFlow;e._walletFlow=true;try{return root.MasalMeetingRules.atomic(e,fn)}finally{e._walletFlow=previous}}
P.walletIdentity=function(){return own(this)};
P.walletParent=function(){return parent(this.s,own(this))};
P.walletChildren=function(){const id=own(this);if(id==='@owner')return this.s.agents.filter(a=>!a.parent&&a.active&&this.allowed(a.id));return [...this.s.agents.filter(a=>a.parent===id),...this.s.pos.filter(p=>p.agent===id)].filter(a=>a.active)};
P.walletRequestVisible=function(r){const id=own(this);return (r.from===id||r.to===id)&&this.allowed(this.accountAgent(r.to))};
P.requestWalletFunding=function(value,kind,note,key){
 this.operations();this.requirePermission('wallets.request');const to=own(this),from=parent(this.s,to);if(!from||to==='@owner')throw Error('لا توجد جهة أعلى لهذا الحساب');
 active(this,to);if(from!=='@owner'&&!this.s.agents.find(a=>a.id===from)?.active)throw Error('حساب الجهة الأعلى موقوف');
 value=amount(value);service(this,kind);if(!key)throw Error('معرف الطلب مطلوب');
 note=String(note||'').trim();const old=this.s.fundingRequests.find(r=>r.key===key);
 if(old){if(old.to!==to||old.from!==from||old.amount!==value||old.service!==kind||old.purpose!==note)throw Error('معرف الطلب مستخدم لبيانات مختلفة');return old}
 const r={id:M.id('FR'),key,from,to,amount:value,service:kind,purpose:note,status:'بانتظار التمويل',time:now(),user:this.user,simpleWallet:1};
 this.s.fundingRequests.unshift(r);this.log('طلب تمويل من الجهة الأعلى',r.id,null,{from,to,amount:value,service:kind});return r;
};
P.walletFundingBatches=function(r){
 if(!r||r.from!=='@owner'||r.service!=='voucher')return [];
 return this.s.batches.filter(b=>b.agent===r.to&&['Loaded','Partially Used'].includes(b.status)&&b.created>=r.time&&!b.walletFundingRequest&&this.s.batchInvoices.some(i=>i.batch===b.id&&i.status!=='معكوسة'&&Math.round(i.amount*100)===Math.round(r.amount*100)));
};
P.reviewWalletFunding=function(id,decision,details={}){
 this.operations();this.requirePermission('wallets.approve');const r=this.s.fundingRequests.find(r=>r.id===id);
 if(!r||r.from!==own(this)||!this.walletRequestVisible(r))throw Error('الطلب ليس موجّهًا لحسابك');
 if(!['approve','reject'].includes(decision))throw Error('قرار غير صالح');
 if(r.status==='منفذ'&&decision==='approve')return r;
 if(!['بانتظار التمويل','معتمد ومحجوز'].includes(r.status))throw Error('تمت معالجة الطلب مسبقًا');
 active(this,r.to);if(parent(this.s,r.to)!==r.from)throw Error('تغيّر تسلسل الحساب؛ أعد تقديم الطلب');
 service(this,r.service);amount(r.amount);
 if(decision==='reject'&&!String(details.reason||'').trim())throw Error('سبب الرفض مطلوب');
 if(r.status==='معتمد ومحجوز'&&decision==='reject')throw Error('الطلب معتمد سابقًا؛ ألغِ حجزه من تفاصيل الأرصدة أولًا');
 return atomic(this,()=>{
 if(decision==='reject'){r.status='مرفوض';r.reason=details.reason.trim()}
 else if(r.from==='@owner'){
 if(r.service==='voucher'){
 this.requirePermission('import.approve');
 const b=this.walletFundingBatches(r).find(b=>b.id===details.batch);
 if(!b)throw Error('اختر طلبية معتمدة بعد الطلب وبنفس القيمة ولم ترتبط بطلب تمويل آخر');
 b.walletFundingRequest=r.id;r.batch=b.id;r.fulfillment='stock';r.reference=b.id;
 }else{
 this.requirePermission('wallets.deposit');const reference=String(details.reference||'').trim();
 if(!reference)throw Error('مرجع الإيداع مطلوب');
 this.serviceCredit(r.to,r.service,r.amount,reference,'WALLET-REQUEST:'+r.id);r.reference=reference;r.fulfillment='deposit';
 }
 r.status='منفذ';r.approvedAmount=r.amount;
 }else if(r.status==='معتمد ومحجوز'){
 const h=this.s.fundingHolds.find(h=>h.request===id&&h.status==='محجوز');if(!h)throw Error('الحجز غير موجود');
 const t=this.completeFunding(h.id);r.transfer=t.id;r.approvedAmount=t.amount;r.status='منفذ';
 }else{
 const t=this.fund(r.from,r.to,r.amount,r.service,'WALLET-REQUEST:'+r.id);
 r.status='منفذ';r.approvedAmount=t.amount;r.transfer=t.id;
 }
 r.reviewedAt=now();r.approverId=this.user;
 this.log(decision==='approve'?'موافقة وتمويل طلب':'رفض طلب تمويل',r.id,null,{from:r.from,to:r.to,amount:r.amount,service:r.service,reason:r.reason||'',batch:r.batch||'',reference:r.reference||''});return r;
 });
};
P.cancelWalletFunding=function(id){
 this.operations();this.requirePermission('wallets.request');const r=this.s.fundingRequests.find(r=>r.id===id);
 if(!r||r.to!==own(this))throw Error('يمكن إلغاء طلبات حسابك فقط');
 if(r.status==='ملغي')return r;if(r.status!=='بانتظار التمويل')throw Error('يمكن إلغاء الطلب قبل الموافقة فقط');
 r.status='ملغي';r.cancelledAt=now();r.cancelledBy=this.user;this.log('إلغاء طلب تمويل',id,null,{from:r.from,to:r.to});return r;
};
P.directWalletFunding=function(to,value,kind,key){
 this.operations();this.requirePermission('wallets.transfer');const from=own(this);if(from==='@owner')throw Error('تمويل الإدارة يتم عبر الطلبات الواردة وإيداع موثق أو طلبية مخزون');
 if(!this.walletChildren().some(a=>a.id===to))throw Error('اختر أحد التابعين المباشرين لحسابك');
 active(this,to);service(this,kind);value=amount(value);
 return atomic(this,()=>this.fund(from,to,value,kind,key));
};
// Old entry points must not bypass the new decision and cancellation rules.
const process=P.processFunding;P.processFunding=function(id,value,...args){const r=this.s.fundingRequests.find(r=>r.id===id);if(r?.simpleWallet){if(Number(value)!==r.amount)throw Error('اعتمد المبلغ المطلوب دون تغييره');return this.reviewWalletFunding(id,'approve')}if(r&&!['بانتظار التمويل','منفذ','معتمد ومحجوز'].includes(r.status))throw Error('الطلب غير متاح');return process.call(this,id,value,...args)};
const reserve=P.reserveFunding;P.reserveFunding=function(id,...args){const r=this.s.fundingRequests.find(r=>r.id===id);if(r?.simpleWallet)throw Error('استخدم موافقة وتمويل لتنفيذ الطلب مباشرة');return reserve.call(this,id,...args)};
const component={
 props:{walletService:{type:String,default:'voucher'}},
 data(){return {tab:'request',value:'',note:'',to:'',key:M.id('WF'),review:{},directConfirm:false,error:'',busy:false,filter:'all'}},
 computed:{
 kind(){return this.services.some(s=>s.id===this.walletService)?this.walletService:''},
 vm(){return this.$root},e(){return this.vm.engine},s(){return this.vm.s},me(){return this.e.walletIdentity()},admin(){return this.me==='@owner'},parent(){return this.e.walletParent()},
 services(){return [{id:'voucher',name:'رصيد البطاقات'},{id:'topup',name:'Top-up'},...this.s.providers.filter(p=>p.connection==='API').map(p=>({id:'api:'+p.id,name:p.name}))]},
 ownSummary(){return this.kind?this.vm.walletOwnSummary(this.kind):null},children(){return this.e.walletChildren()},available(){return this.admin||!this.kind?0:this.e.serviceAvailable(this.me,this.kind)},
 requests(){return this.s.fundingRequests.filter(r=>this.e.walletRequestVisible(r))},
 incoming(){return this.requests.filter(r=>r.from===this.me&&['بانتظار التمويل','معتمد ومحجوز'].includes(r.status))},
 history(){const tx=new Set(this.requests.map(r=>r.transfer).filter(Boolean));return [...this.requests.map(r=>({...r,recordType:'request'})),...this.s.fundingTransfers.filter(t=>(t.from===this.me||t.to===this.me)&&!tx.has(t.id)).map(t=>({...t,recordType:'transfer'}))].filter(r=>this.filter==='all'||this.status(r)===this.filter).sort((a,b)=>b.time.localeCompare(a.time))},
 tabs(){return [...(!this.admin&&this.vm.can('wallets.request')?[{id:'request',name:'طلب تمويل'}]:[]),...(this.vm.can('wallets.approve')?[{id:'incoming',name:'طلبات واردة'}]:[]),...(!this.admin&&this.children.length&&this.vm.can('wallets.transfer')?[{id:'direct',name:'تمويل مباشر'}]:[]),{id:'history',name:'سجل التمويل'}]}
 },
 mounted(){this.tab=this.tabs[0]?.id||'history'},
watch:{incoming:{immediate:true,handler(rows){rows.forEach(r=>this.edit(r))}},'vm.currentUser'(){if(this.$refs.fundingSection)this.$refs.fundingSection.open=false;this.reset();this.tab=this.tabs[0]?.id||'history';this.review={};this.incoming.forEach(r=>this.edit(r))},kind(){this.directConfirm=false;this.key=M.id('WF')},value(){this.directConfirm=false;this.key=M.id('WF')},to(){this.directConfirm=false;this.key=M.id('WF')}},
 methods:{
 name(id){return id==='@owner'?'إدارة النظام':this.s.agents.find(a=>a.id===id)?.name||this.s.pos.find(p=>p.id===id)?.name||id},
 service(id){return id==='cash'?'سجل نقدي سابق':this.services.find(s=>s.id===id)?.name||id},
 status(r){return {'بانتظار التمويل':'بانتظار الموافقة','معتمد ومحجوز':'بانتظار التسليم','ملغى':'ملغي'}[r.status]||r.status},
 reset(){this.value='';this.note='';this.to='';this.key=M.id('WF');this.directConfirm=false;this.error=''},
 act(fn,message){if(this.busy)return;this.busy=true;this.error='';try{fn();this.vm.persist();this.vm.notify(message)}catch(e){this.error=e.message}finally{this.busy=false}},
 request(){this.act(()=>{if(!this.kind)throw Error('اختر محفظة من كروت المحافظ أولًا');this.e.requestWalletFunding(this.value,this.kind,this.note,this.key);this.reset();this.tab='history'},'أرسل طلب التمويل إلى الجهة الأعلى')},
 direct(){if(!this.directConfirm){this.directConfirm=true;return}this.act(()=>{this.e.directWalletFunding(this.to,this.value,this.kind,this.key);this.reset();this.tab='history'},'تم التمويل وتحويل الرصيد')},
 decide(r,decision){this.act(()=>{this.e.reviewWalletFunding(r.id,decision,this.review[r.id]||{});delete this.review[r.id]},decision==='approve'?'تم تنفيذ طلب التمويل':'تم رفض طلب التمويل')},
 cancel(r){this.act(()=>this.e.cancelWalletFunding(r.id),'تم إلغاء الطلب')},
 edit(r){this.review[r.id]??={reference:'',batch:'',reason:''}},
 loadOrder(r){this.vm.walletOrderAgent=r.to;this.vm.go('import');this.vm.notify('حمّل طلبية بقيمة '+this.vm.money(r.amount)+' ثم ارجع لربطها بطلب التمويل')},
 batches(r){return this.e.walletFundingBatches(r)}
 },
 template:`<section class="simple-wallets">
 <details class="card wallet-funding-fold" ref="fundingSection"><summary><strong>{{admin?'طلبات تمويل الوكلاء':'طلبات وسجل التمويل'}}</strong><span class="wallet-fold-label">عرض / إخفاء</span></summary><div class="wallet-funding-body"><p v-if="tab==='request'||tab==='direct'" class="caption">محفظة التمويل: {{kind?service(kind):'اختر محفظة من كروت المحافظ'}}</p>
 <div class="tabs"><button v-for="t in tabs" :class="{active:tab===t.id}" @click="tab=t.id;error='';directConfirm=false">{{t.name}}<span v-if="t.id==='incoming'&&incoming.length" class="badge">{{incoming.length}}</span></button></div>
 <form v-if="tab==='request'" @submit.prevent="request"><div class="formgrid"><label>إلى الجهة الأعلى<input :value="name(parent)" readonly></label><label>المبلغ المطلوب<input type="number" min="0.01" step="0.01" v-model="value" required></label><label>ملاحظة اختيارية<input v-model="note"></label></div><p v-if="parent==='@owner'&&kind==='voucher'" class="help">رصيد البطاقات يجهّز بطلبية مخزون معتمدة بنفس القيمة.</p><div class="actions"><button class="btn primary" :disabled="busy||!(Number(value)>0)">إرسال طلب التمويل</button></div></form>
 <form v-if="tab==='direct'" @submit.prevent="direct"><div class="formgrid"><label>المستفيد<select v-model="to" required><option value="">اختر تابعًا</option><option v-for="a in children" :value="a.id">{{a.name}}</option></select></label><label>مبلغ التمويل<input type="number" min="0.01" step="0.01" :max="available" v-model="value" required></label></div><p>المتاح: {{vm.money(available)}} د.ع · المتبقي بعد التحويل: {{vm.money(available-Number(value||0))}} د.ع</p><p v-if="directConfirm" class="notice">تأكيد تحويل {{vm.money(value)}} د.ع إلى {{name(to)}} من {{service(kind)}}.</p><button class="btn primary" :disabled="busy||!to||!(Number(value)>0)||Number(value)>available">{{directConfirm?'تأكيد التمويل':'تمويل'}}</button></form>
 <div v-if="tab==='incoming'"><article v-for="r in incoming" :key="r.id" class="wallet-request"><div class="rowline"><strong>{{name(r.to)}}</strong><strong>{{vm.money(r.amount)}} د.ع · {{service(r.service)}}</strong><span class="badge">{{status(r)}}</span></div><p v-if="r.purpose">{{r.purpose}}</p><small>{{vm.formatTime(r.time)}} · {{r.id}}</small>
 <div v-if="admin&&r.service==='voucher'" class="notice">الرصيد يُضاف عند اعتماد الطلبية. ربطها هنا لا يضيف رصيدًا ثانيًا.<button v-if="vm.can('import.view')" class="btn small" @click="loadOrder(r)">تحميل طلبية</button></div>
 <div v-if="!admin" class="caption">رصيدك المتاح لهذه المحفظة: {{vm.money(e.serviceAvailable(me,r.service))}} د.ع</div>
 <button v-if="!review[r.id]" class="btn" @click="edit(r)">مراجعة الطلب</button>
 <div v-else><label v-if="admin&&r.service==='voucher'">الطلبية المعتمدة<select v-model="review[r.id].batch"><option value="">اختر طلبية بنفس القيمة</option><option v-for="b in batches(r)" :value="b.id">{{vm.batchLabel(b)}}</option></select></label><label v-if="admin&&r.service!=='voucher'">مرجع الإيداع<input v-model="review[r.id].reference" placeholder="رقم الإيداع أو السند"></label><div class="actions"><button class="btn primary" :disabled="busy||(admin&&(r.service==='voucher'?!review[r.id].batch:!review[r.id].reference.trim()))" @click="decide(r,'approve')">{{admin&&r.service==='voucher'?'اعتماد وربط الطلبية':'موافقة وتمويل'}}</button></div><label>سبب الرفض<input v-model="review[r.id].reason"></label><button class="btn danger" :disabled="busy||!review[r.id].reason.trim()||r.status==='معتمد ومحجوز'" @click="decide(r,'reject')">رفض الطلب</button></div></article><p v-if="!incoming.length" class="empty">لا توجد طلبات واردة بانتظار الإجراء</p></div>
 <div v-if="tab==='history'"><label>حالة الطلب<select v-model="filter"><option value="all">كل الحالات</option><option v-for="s in ['بانتظار الموافقة','بانتظار التسليم','منفذ','مرفوض','ملغي']">{{s}}</option></select></label><div class="tablewrap"><table><thead><tr><th>التاريخ</th><th>الجهة الأعلى / الممول</th><th>المستفيد</th><th>المحفظة</th><th>المبلغ</th><th>الحالة</th><th>التفاصيل</th></tr></thead><tbody><tr v-for="r in history" :key="r.id"><td>{{vm.formatTime(r.time)}}</td><td>{{name(r.from)}}</td><td>{{name(r.to)}}</td><td>{{service(r.service)}}</td><td>{{vm.money(r.approvedAmount??r.amount)}}</td><td><span class="badge">{{status(r)}}</span></td><td>{{r.reason||r.reference||r.id}}<button v-if="r.recordType==='request'&&r.to===me&&r.status==='بانتظار التمويل'&&vm.can('wallets.request')" class="btn small" :disabled="busy" @click="cancel(r)">إلغاء الطلب</button></td></tr><tr v-if="!history.length"><td colspan="7" class="empty">لا توجد عمليات</td></tr></tbody></table></div></div>
 <p v-if="error" class="notice warn" role="alert">{{error}}</p></div></details></section>`
};
function install(o){
 component.template=component.template.replace('<select v-model="to" required>','<select v-model="to" aria-label="المستفيد" required>');
 const data=o.data;o.data=function(){return {...data.call(this),walletOrderAgent:''}};
 const form=o.components['cash-order-form'],formData=form.data;form.data=function(){const d=formData.call(this);if(this.$root.walletOrderAgent){d.draft.agent=this.$root.walletOrderAgent;this.$root.walletOrderAgent=''}return d};
 const panel=o.components['operations-panel'];panel.components??={};panel.components['simple-wallets']=component;
 panel.template=panel.template.replace("<template v-if=\"page==='wallets'\">","<template v-if=\"page==='wallets'\"><simple-wallets :wallet-service=\"service\"></simple-wallets><section class=\"wallet-advanced\">");
 const marker="</template>\n\n <div v-if=\"page==='exceptions'\"";if(!panel.template.includes(marker))throw Error('Wallet template boundary missing');
 panel.template=panel.template.replace(marker,"</section></template>\n\n <div v-if=\"page==='exceptions'\"");
 panel.template=panel.template.replace("{id:'fund',name:'تمويل وطلبات'},",'');
}
root.MasalSimpleWallets={install};
})(globalThis);
