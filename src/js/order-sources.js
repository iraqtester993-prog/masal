(function(root){
'use strict';
for(const [verb,label] of [['view','عرض'],['create','إضافة'],['edit','تعديل'],['toggle','تفعيل وتعطيل']])MasalAccess.catalog.push({key:'sources.'+verb,module:'sources',group:'المصادر',label,sensitive:verb!=='view'});
const P=Masal.Engine.prototype;
P.saveOrderSource=function(draft){
 this.s.orderSources??=[];const old=this.s.orderSources.find(x=>x.id===draft.id);
 this.requirePermission('sources.'+(old?'edit':'create'));
 const name=String(draft.name||'').trim(),provider=this.s.providers.find(p=>p.id===draft.provider&&p.active);
 if(!name)throw Error('أدخل اسم المصدر');if(!provider)throw Error('اختر شركة مفعلة');
 if(this.s.orderSources.some(x=>x.id!==old?.id&&x.provider===provider.id&&x.name.trim().toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('اسم المصدر مسجل لهذه الشركة');
 const before=old?Masal.clone(old):null,record={id:old?.id||Masal.id('SOURCE'),name,provider:provider.id,active:old?.active??true};
 if(old)Object.assign(old,record);else this.s.orderSources.push(record);
 this.log(old?'تعديل مصدر':'إضافة مصدر',record.id,before,record);return record;
};
P.toggleOrderSource=function(id){this.requirePermission('sources.toggle');const r=this.s.orderSources?.find(x=>x.id===id);if(!r)throw Error('المصدر غير موجود');const before=Masal.clone(r);r.active=!r.active;this.log(r.active?'تفعيل مصدر':'تعطيل مصدر',id,before,Masal.clone(r));};
function install(o,nav){
 nav.find(g=>g.title==='البطاقات والعمليات').items.push({id:'sources',label:'المصادر',icon:'◈',description:''});
 const data=o.data;o.data=function(){const d=data.call(this);d.s.orderSources??=[];return d};
 const validate=P.validateImport;P.validateImport=function(meta,rows){if(meta.sourceId){const p=this.s.products.find(p=>p.id===meta.product),source=this.s.orderSources?.find(x=>x.id===meta.sourceId);if(!source?.active||source.provider!==p?.provider||!this.s.providers.some(x=>x.id===source.provider&&x.active))throw Error('اختر مصدرًا مفعّلًا تابعًا لشركة الفئة');}return validate.call(this,meta,rows)};
 o.components['order-sources']={data(){return {query:'',draft:{name:'',provider:''},editing:false,error:''}},computed:{vm(){return this.$root},rows(){const q=this.query.trim().toLocaleLowerCase();return (this.vm.s.orderSources||[]).filter(r=>(r.name+' '+this.vm.nameOf('providers',r.provider)).toLocaleLowerCase().includes(q))}},methods:{edit(row){this.draft=row?Masal.clone(row):{name:'',provider:''};this.error='';this.editing=true},save(){try{this.vm.engine.saveOrderSource(this.draft);this.vm.persist();this.editing=false;this.vm.notify('تم حفظ المصدر')}catch(e){this.error=e.message}}},template:`<section v-if="vm.page==='sources'&&vm.can('sources.view')" class="card"><div class="toolbar"><button v-if="vm.can('sources.create')" class="btn primary" @click="edit()">إضافة مصدر</button><input v-model="query" placeholder="بحث باسم المصدر أو الشركة"></div><form v-if="editing" @submit.prevent="save"><div class="formgrid"><label>اسم المصدر<input v-model="draft.name" required maxlength="150"></label><label>الشركة<select v-model="draft.provider" required><option value="" disabled>اختر الشركة</option><option v-for="p in vm.s.providers.filter(p=>p.active)" :value="p.id">{{p.name}}</option></select></label></div><div v-if="error" class="notice warn" role="alert">{{error}}</div><div class="formfoot"><button class="btn primary" type="submit">حفظ المصدر</button><button class="btn" type="button" @click="editing=false">إلغاء</button></div></form><div class="tablewrap"><table><thead><tr><th>اسم المصدر</th><th>الشركة</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td>{{r.name}}</td><td>{{vm.nameOf('providers',r.provider)}}</td><td><span class="badge" :class="{neutral:!r.active}">{{r.active?'مفعل':'معطل'}}</span></td><td><div class="actions"><button v-if="vm.can('sources.edit')" class="btn small" @click="edit(r)">تعديل</button><button v-if="vm.can('sources.toggle')" class="btn small" @click="vm.run(()=>vm.engine.toggleOrderSource(r.id))">{{r.active?'تعطيل':'تفعيل'}}</button></div></td></tr></tbody></table></div><div v-if="!rows.length" class="empty">لا توجد مصادر</div></section>`};
 const f=o.components['cash-order-form'],fd=f.data,next=f.methods.next;
 f.data=function(){const d=fd.call(this);d.draft.sourceId='';return d};
 f.computed.orderSources=function(){const p=this.vm.s.products.find(p=>p.id===this.draft.product);return (this.vm.s.orderSources||[]).filter(r=>r.active&&r.provider===p?.provider&&this.vm.s.providers.some(c=>c.id===r.provider&&c.active))};
 f.watch={...f.watch,'draft.product':function(){this.draft.sourceId='';this.draft.supplier=''}};
 f.methods.next=function(){const source=this.orderSources.find(r=>r.id===this.draft.sourceId);if(!source){this.error='اختر المصدر التابع لشركة الفئة';return}this.draft.supplier=source.name;this.draft.sourceCompany=this.vm.nameOf('providers',source.provider);return next.call(this)};
 f.template=f.template.replace('<label>المجهز<input v-model="draft.supplier" required></label>','<label>المصدر<select v-model="draft.sourceId" :disabled="!draft.product" required><option value="" disabled>{{!draft.product?"اختر الفئة أولًا":orderSources.length?"اختر المصدر":"لا توجد مصادر مفعلة لهذه الشركة"}}</option><option v-for="r in orderSources" :key="r.id" :value="r.id">{{r.name}} — {{vm.nameOf("providers",r.provider)}}</option></select></label>');
 f.template=f.template.replace('<div class="cash-order-summary">','<div class="cash-order-summary"><div class="cash-order-detail"><span>المصدر والشركة</span><b>{{snapshot.supplier}} — {{snapshot.sourceCompany}}</b></div>');
}
root.MasalOrderSources={install};
})(globalThis);
