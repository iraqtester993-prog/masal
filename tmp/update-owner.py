from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
summary='''<div v-if="actor.role==='owner'" class="owner-summary" aria-label="ملخص جميع الحسابات"><button v-for="item in accountSummary" class="card" @click="go(item.page)"><span>{{tr(item.label)}}</span><strong>{{item.value}}</strong><small>{{tr('عرض التفاصيل')}} ←</small></button></div>'''
marker='<template v-if="page===\'dashboard\'">'
assert marker in s
s=s.replace(marker,marker+summary,1)
marker='<template v-else-if="schema">'
s=s.replace(marker,marker+'<template v-if="page===\'users\'">'+summary+'</template>',1)
marker='<button v-if="page===\'users\'" class="btn small" v-permit="can(\'permissions.view\')"'
assert marker in s
s=s.replace(marker,'<button v-if="page===\'users\'&&actor.role===\'owner\'" class="btn small" @click="showAccountDetails(row)">{{tr("تفاصيل الحساب")}}</button>'+marker,1)
marker='<form v-else-if="modal.kind===\'staff\'"'
details='''<template v-else-if="modal.kind==='accountDetails'&&accountDetails"><div class="account-details"><div class="notice">{{tr('بيانات الحساب وارتباطاته في جميع الفروع. السجلات أدناه تعرض العمليات المسجلة باسم المستخدم.')}}</div><dl class="account-fields"><div v-for="f in accountDetails.fields"><dt>{{tr(f.key)}}</dt><dd>{{f.value||'—'}}</dd></div><div><dt>{{tr('كلمة المرور')}}</dt><dd>{{tr(accountDetails.user.credentials?'محددة':'غير محددة')}}</dd></div></dl><h3>{{tr('نطاق بيانات الحساب')}}</h3><p v-if="!accountDetails.user.active" class="notice">{{tr('الحساب موقوف؛ يظهر أدناه نطاقه المسند عند التفعيل.')}}</p><p v-if="accountDetails.user.role==='owner'">{{tr('جميع بيانات النظام وجميع الفروع')}}</p><div class="account-links"><span v-for="a in accountDetails.agents" class="badge">{{a.name}} · {{tr(a.active?'مفعل':'موقوف')}}</span></div><p v-if="!accountDetails.agents.length">{{tr('لا يوجد نطاق وكلاء مسند')}}</p><h3>{{tr('نقاط البيع والأجهزة ضمن النطاق')}}</h3><div class="tablewrap"><table><thead><tr><th>{{tr('الاسم')}}</th><th>{{tr('الوكيل')}}</th><th>{{tr('الجهاز')}}</th><th>{{tr('الحالة')}}</th></tr></thead><tbody><tr v-for="p in accountDetails.pos"><td>{{p.name}}</td><td>{{nameOf('agents',p.agent)}}</td><td>{{p.serial}} · {{p.model}}</td><td>{{tr(p.active?'مفعل':'موقوف')}}</td></tr></tbody></table></div><h3>{{tr('الصلاحيات الفعلية')}} · {{accountDetails.permissions.length}}</h3><details><summary>{{tr('عرض جميع الصلاحيات')}}</summary><div class="account-links"><span class="badge" v-for="p in accountDetails.permissions">{{tr(p.group)}} · {{tr(p.label)}}</span></div></details><h3>{{tr('مدخلات المستخدم وتعديلاته')}} · {{accountDetails.audit.length}}</h3><p class="help">{{tr('يعرض السجل العمليات المنفذة بهذا الحساب؛ نطاق البيانات أعلاه لا يعني أن المستخدم أنشأ جميع سجلاته.')}}</p><div v-if="!accountDetails.audit.length" class="empty">{{tr('لا توجد عمليات مسجلة لهذا المستخدم')}}</div><details v-for="r in accountDetails.audit" class="account-event"><summary>{{r.action}} · {{r.entity}} · {{formatTime(r.time)}}</summary><h4>{{tr('قبل التعديل')}}</h4><pre>{{accountAuditValue(r.before)}}</pre><h4>{{tr('بعد التعديل')}}</h4><pre>{{accountAuditValue(r.after)}}</pre></details><div class="formfoot"><button class="btn" @click="closeModal">{{tr('إغلاق')}}</button><button class="btn primary" @click="openEdit(accountDetails.user)">{{tr('تعديل بيانات الحساب')}}</button></div></div></template>'''
assert marker in s
s=s.replace(marker,details+marker,1)
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8');s=s.replace("this.s.notifications.filter(n=>n.target==='all'||", "this.s.notifications.filter(n=>this.actor.role==='owner'||n.target==='all'||")
p.write_text(s,encoding='utf-8')
