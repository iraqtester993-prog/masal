(function(root){
'use strict';
const A=root.MasalAccess,S=root.MasalStaff,M=root.Masal;
function linked(state,page,id){return state.users.find(u=>page==='pos'?u.role==='pos'&&u.pos===id:['main','sub'].includes(u.role)&&u.agent===id);}
function validate(e,page,v,login){
 const actor={...e.actor(),role:A.managementRole(e.s,e.actor())},old=e.s[page].find(x=>x.id===v.id);
 if(page==='agents'&&!old&&A.branchCreationBlocked(e.s,e.actor()))throw Error('الفرعي التابع لفرعي يمكنه إنشاء نقاط بيع فقط، ولا يمكنه إنشاء فروع');
 e.requirePermission(page+'.'+(old?'edit':'create'));
 if(JSON.stringify(v.networkRules||{})!==JSON.stringify(old?.networkRules||{}))throw Error('تعديل الصلاحيات يتم من نافذة صلاحيات التابع');
 if(!['owner','main','sub'].includes(actor.role))throw Error('إنشاء وإدارة حسابات الشبكة متاحة لمدير النظام والوكيل المسؤول فقط');
 if(old)e.require(page==='agents'?old.id:old.agent);
 if(['agents','pos'].includes(page)&&v.city&&(!old||old.city!==v.city)&&!root.MasalRegions.isActive(e.s,v.city))throw Error('اختر محافظة مفعلة');
 if(page==='agents'){
  if(!String(v.city||'').trim())throw Error('اختر محافظة الوكيل');
  if(!['رئيسي','فرعي'].includes(v.type))throw Error('نوع الوكيل غير صالح');
  if(!old&&!e.s.settings.registration)throw Error('تسجيل الوكلاء موقوف');
  if(old&&(old.type!==v.type||old.parent!==v.parent))throw Error('لا يمكن تغيير مستوى الوكيل أو تبعيته من التعديل');
  if(v.type==='رئيسي'){if(v.parent)throw Error('الوكيل الرئيسي لا يتبع وكيلاً آخر');if(!old&&actor.role!=='owner')throw Error('إنشاء الوكيل الرئيسي خاص بمدير النظام');}
  else {const parent=e.s.agents.find(a=>a.id===v.parent);if(!parent)throw Error('اختر الوكيل الأعلى');e.require(parent.id);if(!old&&['main','sub'].includes(actor.role)&&v.parent!==actor.agent)throw Error('الوكيل الفرعي يجب أن يتبع حسابك');}
 }else{
  const agent=e.s.agents.find(a=>a.id===v.agent);if(!agent)throw Error('اختر الوكيل التابع');e.require(agent.id);
  if(!old&&actor.role!=='owner'&&v.agent!==actor.agent)throw Error('نقطة البيع الجديدة يجب أن تتبع حسابك مباشرة');
  if(old&&old.agent!==v.agent)throw Error('نقل نقطة بين الوكلاء يحتاج تسوية مستقلة');
 }
 const existing=old&&linked(e.s,page,old.id);
 if(existing)return {existing};
 const email=String(login.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('أدخل بريد حساب الدخول بصورة صحيحة');
 if(e.s.users.some(u=>String(u.email||'').trim().toLowerCase()===email))throw Error('البريد الإلكتروني مستخدم لحساب آخر');
 if(String(login.password||'').length<8)throw Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
 return {email,role:page==='pos'?'pos':v.type==='رئيسي'?'main':'sub'};
}
function attach(e,page,entity,checked,credentials){
 if(checked.existing)return checked.existing;
 if(linked(e.s,page,entity.id))throw Error('لهذه الجهة حساب مرتبط مسبقًا');
 const user={id:M.id('USER'),name:entity.name,email:checked.email,role:checked.role,active:true,agent:page==='agents'?entity.id:entity.agent,pos:page==='pos'?entity.id:'',credentials};
 // Ancestor limits are evaluated live, so later restrictions and restorations reach existing descendants.
 e.s.users.push(user);e.log('إنشاء حساب '+({main:'وكيل رئيسي',sub:'وكيل فرعي',pos:'نقطة بيع'}[user.role]),user.id,null,{name:user.name,email:user.email,role:user.role,agent:user.agent,pos:user.pos});return user;
}
function permissionTarget(e,page,id){
 e.requirePermission('agents.permissions');
 if(!['agents','pos'].includes(page)||!['owner','main','sub'].includes(A.managementRole(e.s,e.actor())))throw Error('غير مسموح بإدارة صلاحيات هذه الجهة');
 const record=e.s[page].find(x=>x.id===id),user=linked(e.s,page,id);if(!record||!user)throw Error('أنشئ حساب دخول للجهة أولًا');
 const path=A.networkPath(e.s,user);if(!path)throw Error('تبعية غير صالحة');
 if(A.managementRole(e.s,e.actor())!=='owner'&&(!path.some(x=>x.id===e.actor().agent)||(page==='agents'&&id===e.actor().agent)))throw Error('يمكن تعديل صلاحيات التابعين فقط، وليس حسابك أو الأعلى أو شبكة أخرى');
 e.require(page==='agents'?record.id:record.agent);
 return {record,user,path};
}
function candidateRules(e,target,key,value){
 const rules=M.clone(target.record.networkRules||{}),authority=e.actor().role==='owner'?'@owner':e.actor().agent;
 const rank=id=>id==='@owner'?Infinity:target.path.findIndex(x=>x.id===id),level=rank(authority);
 // Higher authorities may replace lower decisions; lower authorities cannot erase higher decisions.
 for(const [id,entries] of Object.entries(rules))if(rank(id)<=level){delete entries[key];if(!Object.keys(entries).length)delete rules[id];}
 rules[authority]??={};rules[authority][key]=value?'allow':'deny';return rules;
}
function canEnable(e,page,id,key,draft={}){
 try{const target=permissionTarget(e,page,id);if(!A.defaults(target.user.role,key)||!e.can(key))return false;
 const candidate={...target.record,networkRules:M.clone(target.record.networkRules||{})};
 for(const [other,value]of Object.entries(draft))candidate.networkRules=candidateRules(e,{...target,record:candidate},other,value);
 candidate.networkRules=candidateRules(e,{...target,record:candidate},key,true);
 const state={...e.s,[page]:e.s[page].map(r=>r.id===id?candidate:r)};
 return A.can({...target.user,active:true},key,state);
 }catch{return false;}
}
function saveNetworkPermissions(e,page,id,changes,reason){
 const target=permissionTarget(e,page,id);if(!String(reason||'').trim())throw Error('اكتب سبب تعديل الصلاحيات');
 const entries=Object.entries(changes);if(!entries.length)throw Error('لم تغير أي صلاحية');
 // Work on a copy so a rejected grant never leaves partial changes.
 const candidate={...target.record,networkRules:M.clone(target.record.networkRules||{})},state={...e.s,[page]:e.s[page].map(r=>r.id===id?candidate:r)},temp=new M.Engine(state,e.user);
 for(const [key,value]of entries){if(typeof value!=='boolean'||!A.catalog.some(p=>p.key===key)||!A.defaults(target.user.role,key))throw Error('صلاحية غير قابلة للإسناد لهذا الدور');if(value&&!e.can(key))throw Error('لا يمكنك منح صلاحية لا تملكها');candidate.networkRules=candidateRules(temp,{...target,record:candidate},key,value);}
 for(const [key,value]of entries)if(value&&!A.can({...target.user,active:true},key,state))throw Error('هذه الصلاحية ممنوعة من الأعلى أو تتطلب صلاحية عرض القسم');
 const before=M.clone(target.record.networkRules||{});target.record.networkRules=candidate.networkRules;
 e.log('تعديل صلاحيات تابع',id,before,{rules:candidate.networkRules,changes,reason:reason.trim()});return target.record;
}
function install(o){
 const data=o.data,open=o.methods.openEdit,save=o.methods.saveEntity,close=o.methods.closeModal,options=o.methods.optionsFor;
 o.data=function(){return {...data.call(this),networkLogin:{email:'',password:''},networkSaving:false,networkPermissionDraft:{},networkPermissionInitial:{},networkPermissionReason:'',networkPermissionSearch:''}};
 o.methods.canManageNetwork=function(page,id){try{permissionTarget(this.engine,page,id);return true}catch{return false}};
 o.methods.openNetworkPermissions=function(page,id){this.run(()=>{
  const target=permissionTarget(this.engine,page,id);
  this.networkPermissionDraft=Object.fromEntries(A.catalog.filter(p=>A.defaults(target.user.role,p.key)).map(p=>[p.key,A.can({...target.user,active:true},p.key,this.s)]));
  this.networkPermissionInitial={...this.networkPermissionDraft};this.networkPermissionReason='';this.networkPermissionSearch='';
  this.modal={kind:'networkPermissions',title:'صلاحيات التابع — '+target.record.name,page,id};
 })};
 o.computed.networkPermissionGroups=function(){if(this.modal?.kind!=='networkPermissions')return [];const q=this.networkPermissionSearch.trim();
  const labels={'agents.create':'إنشاء وكلاء فرعيين','pos.create':'إنشاء نقاط بيع','agents.toggle':'إيقاف وتفعيل الوكلاء التابعين','pos.toggle':'إيقاف وتفعيل نقاط البيع','wallets.transfer':'تمويل التابعين','agents.permissions':'إدارة صلاحيات التابعين'};
  const order=['agents','pos','wallets'];const groups=[...A.groups].sort((a,b)=>(order.includes(a[0])?order.indexOf(a[0]):order.length)-(order.includes(b[0])?order.indexOf(b[0]):order.length));
  return groups.map(([module,title])=>({module,title,items:A.catalog.filter(p=>p.module===module&&p.key in this.networkPermissionDraft&&(!q||((labels[p.key]||p.label)+' '+p.group).includes(q))).map(p=>({...p,label:labels[p.key]||p.label,locked:!this.networkPermissionDraft[p.key]&&!canEnable(this.engine,this.modal.page,this.modal.id,p.key,this.networkPermissionDraft)}))})).filter(g=>g.items.length);
 };
 o.methods.saveNetworkPermissions=function(){this.run(()=>{
  const changes=Object.fromEntries(Object.entries(this.networkPermissionDraft).filter(([key,value])=>value!==this.networkPermissionInitial[key]));
  saveNetworkPermissions(this.engine,this.modal.page,this.modal.id,changes,this.networkPermissionReason);this.closeModal();this.persist();
 },'تم تحديث صلاحيات التابع ضمن شبكته')};
 o.methods.startLocalPOSSession=function(){this.run(()=>{
  this.engine.requirePermission('sell.create');
  const p=this.s.pos.find(p=>p.id===this.saleForm.pos);
  if(!p)throw Error('اختر نقطة البيع');
  this.engine.require(p.agent);
  if(this.actor.role==='pos'&&this.actor.pos!==p.id)throw Error('لا يمكنك تشغيل جلسة نقطة أخرى');
  if(!p.active)throw Error('نقطة البيع موقوفة؛ راجع الوكيل المسؤول');
  if(!this.s.settings.sales)throw Error('البيع موقوف من إعدادات النظام');
  if(!this.s.settings.printing)throw Error('الطباعة موقوفة من إعدادات النظام');
  for(const a of this.s.agents)if(this.engine.descendants(a.id).includes(p.agent)&&!a.active)throw Error('أحد وكلاء النقطة موقوف');
  this.engine.checkDevice(p.id);
  if(p.online)return;
  p.online=true;p.lastSeen=new Date().toISOString();
  this.engine.log('بدء جلسة جهاز تجريبية',p.id,{online:false},{online:true,mode:'local-demo'});
 },'بدأت جلسة الجهاز التجريبية؛ يمكنك متابعة الإصدار')};
 o.computed.networkLinkedAccount=function(){return ['agents','pos'].includes(this.page)&&this.editForm.id?linked(this.s,this.page,this.editForm.id):null};
 o.methods.networkFieldLocked=function(f){return ['agents','pos'].includes(this.page)&&((!!this.editForm.id&&['type','parent','agent'].includes(f.key))||(!this.editForm.id&&this.managementRole!=='owner'&&['type','parent','agent'].includes(f.key)))};
 o.methods.optionsFor=function(f){let out=options.call(this,f);if(this.page==='agents'&&f.key==='parent'&&this.editForm.id)out=out.filter(x=>!this.engine.descendants(this.editForm.id).includes(x.value));return out};
 o.methods.openEdit=function(row){if(!row&&this.page==='agents'&&A.branchCreationBlocked(this.s,this.actor)){this.notify('الفرعي التابع لفرعي يمكنه إنشاء نقاط بيع فقط، ولا يمكنه إنشاء فروع',true);return}open.call(this,row);if(!['agents','pos'].includes(this.page)||this.modal?.kind!=='edit')return;this.networkLogin={email:'',password:''};if(!row&&this.managementRole!=='owner'){if(this.page==='agents'){this.editForm.type='فرعي';this.editForm.parent=this.actor.agent}else this.editForm.agent=this.actor.agent}};
 o.methods.closeModal=function(){if(this.networkSaving)return;this.networkLogin={email:'',password:''};return close.call(this)};
 o.methods.saveEntity=async function(){
  if(!['agents','pos'].includes(this.page))return save.call(this);
  if(this.networkSaving)return;
  const page=this.page,entity=M.clone(this.editForm),login={...this.networkLogin},actor=this.currentUser,state=this.s,dialog=this.modal;
  this.networkSaving=true;
  try{
   const first=validate(this.engine,page,entity,login);
   const credentials=first.existing?null:await S.passwordHash(login.password);
   if(this.s!==state||this.currentUser!==actor||this.modal!==dialog||this.page!==page||JSON.stringify(entity)!==JSON.stringify(this.editForm))throw Error('تغير الحساب أو البيانات أثناء الحفظ؛ أعد المحاولة');
   const checked=validate(this.engine,page,entity,login),ids=new Set(this.s[page].map(x=>x.id));
   // Existing entity validation remains in the original save path. Nothing is created if it fails.
   this.networkSaving=false;save.call(this);
   if(this.modal===dialog)return;
   const record=entity.id?this.s[page].find(x=>x.id===entity.id):this.s[page].find(x=>!ids.has(x.id));
   if(record){attach(this.engine,page,record,checked,credentials);this.persist();this.notify(checked.existing?'تم حفظ البيانات':'تم حفظ البيانات وإنشاء حساب الدخول المرتبط')}
  }catch(error){this.notify(error.message,true)}finally{login.password='';this.networkSaving=false}
 };
}
root.MasalNetworkAccounts={install,validate,attach,linked,permissionTarget,canEnable,saveNetworkPermissions};
if(typeof module!=='undefined')module.exports=root.MasalNetworkAccounts;
})(globalThis);
