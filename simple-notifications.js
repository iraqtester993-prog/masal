(function(root){
'use strict';
const P=Masal.Engine.prototype;
const identity=u=>u.role==='owner'||u.role==='employee'&&u.staffAccount==='@system'?'@owner':u.role==='pos'?u.pos:u.staffAccount||u.agent||u.id;
P.noticeUsers=function(){const me=this.actor();return this.s.users.filter(u=>u.active&&u.id!==me.id&&(me.role==='owner'||(me.role!=='pos'&&u.role!=='owner'&&u.agent&&this.allowed(u.agent))))};
P.createNotice=function(title,body,recipients,extra={}){const n={id:Masal.id('NT'),title,body,user:this.user,time:new Date().toISOString(),recipientUsers:[...new Set(recipients)],readBy:[],...extra};this.s.notifications.unshift(n);return n};
P.sendNotice=function(form,mode,selected){this.requirePermission('notifications.send');if(form.image)this.requirePermission('notifications.attach');if(!['all','branches','points','custom'].includes(mode))throw Error('اختر الجمهور');const title=String(form.title||'').trim(),body=String(form.body||'').trim();if(!title||!body)throw Error('العنوان والنص مطلوبان');const allowed=this.noticeUsers();let recipients=allowed;if(mode==='branches')recipients=allowed.filter(u=>['main','sub'].includes(u.role));if(mode==='points')recipients=allowed.filter(u=>u.role==='pos');if(mode==='custom'){if(!Array.isArray(selected)||selected.some(id=>!allowed.some(u=>u.id===id)))throw Error('المستلم خارج نطاقك');recipients=allowed.filter(u=>selected.includes(u.id));}if(!recipients.length)throw Error('اختر مستلمًا واحدًا على الأقل');const n=this.createNotice(title,body,recipients.map(u=>u.id),{audience:mode,image:MasalFeatureUpdates.attachment(form.image)});this.log('إرسال إشعار',n.id,null,{title,recipients:n.recipientUsers});return n};
P.supportNotice=function(t,title,targets){const users=this.s.users.filter(u=>u.active&&u.id!==this.user&&targets.includes(identity(u)));if(users.length)this.createNotice(title,t.title,users.map(u=>u.id),{supportTicket:t.id,audience:'support'})};
const send=P.sendSupport;P.sendSupport=function(f){const t=send.call(this,f);this.supportNotice(t,'رسالة دعم جديدة',[t.recipient]);return t};
const reply=P.replySupport;P.replySupport=function(id,body){reply.call(this,id,body);const t=this.s.tickets.find(t=>t.id===id);this.supportNotice(t,'رد جديد على رسالة الدعم',t.participants)};
const change=P.changeSupport;P.changeSupport=function(id,status){change.call(this,id,status);const t=this.s.tickets.find(t=>t.id===id);this.supportNotice(t,status==='مغلقة'?'تم إغلاق رسالة الدعم':'رسالة دعم مصعّدة',status==='مغلقة'?t.participants:[t.recipient])};
function install(o){const data=o.data;o.data=function(){return {...data.call(this),noticeMode:'all',noticeSelected:[],noticeSearch:''}};
const mounted=o.mounted;o.mounted=function(){mounted.call(this);this._closeNoticePicker=event=>{for(const picker of document.querySelectorAll('.notice-picker[open]'))if(!picker.contains(event.target))picker.open=false};document.addEventListener('pointerdown',this._closeNoticePicker)};
const unmount=o.beforeUnmount;o.beforeUnmount=function(){document.removeEventListener('pointerdown',this._closeNoticePicker);if(unmount)unmount.call(this)};
const oldVisible=o.computed.visibleNotifications;
o.computed.visibleNotifications=function(){const legacy=oldVisible.call(this);return this.s.notifications.filter(n=>Array.isArray(n.recipientUsers)?n.user===this.currentUser||n.recipientUsers.includes(this.currentUser):legacy.includes(n))};
o.computed.unreadNotices=function(){return this.visibleNotifications.filter(n=>n.recipientUsers?.includes(this.currentUser)&&!n.readBy?.includes(this.currentUser)).length};
o.computed.noticeChoices=function(){const q=this.noticeSearch.trim().toLowerCase();return this.engine.noticeUsers().filter(u=>(u.name+' '+(u.email||'')).toLowerCase().includes(q))};
o.methods.sendNotification=function(){if(this.attachmentBusy)return;this.run(()=>{this.engine.sendNotice(this.notificationForm,this.noticeMode,this.noticeSelected);this.notificationForm={title:'',body:'',image:'',target:''};this.noticeSelected=[];this.noticeSearch='';this.noticeMode='all'},'تم الإرسال')};
o.methods.openNotice=function(n){this.run(()=>{if(!this.visibleNotifications.some(x=>x.id===n.id))throw Error('الإشعار خارج نطاقك');if(n.recipientUsers?.includes(this.currentUser)){n.readBy??=[];if(!n.readBy.includes(this.currentUser))n.readBy.push(this.currentUser)}if(n.supportTicket){const t=this.engine.supportCheck(n.supportTicket,'support.view');this.go('support');this.showTicket(t)}})};
const switchUser=o.methods.switchUser;o.methods.switchUser=function(...args){const r=switchUser.apply(this,args);this.noticeSelected=[];this.noticeSearch='';this.noticeMode='all';this.notificationForm={title:'',body:'',target:'',image:''};return r};
}
root.MasalSimpleNotifications={install};
})(globalThis);
