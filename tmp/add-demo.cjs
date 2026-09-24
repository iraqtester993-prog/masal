const fs=require('fs');const creds=JSON.parse(fs.readFileSync('tmp/demo-credentials.json','utf8'));
const code=`// Persistent, additive demonstration network. Never reseed on ordinary reloads.
(function(){
const previousData=appOptions.data;
appOptions.data=function(){
 const d=previousData.call(this),revision='20260924-demo-network-v1';
 if(d.s.demoNetworkRevision===revision)return d;
 const s=Masal.clone(d.s),owner=s.users.find(u=>u.active&&u.role==='owner');
 const ids=['DEMO-MAIN','DEMO-BRANCH','DEMO-SUBBRANCH'],names=['وكيل رئيسي','فرع','فرع فرعي'];
 if(s.agents.some(a=>ids.includes(a.id)))throw Error('تعارض معرفات شبكة العرض؛ البيانات الحالية محفوظة');
 MasalOperations.initialize(s);
 ids.forEach((id,i)=>s.agents.push({id,name:names[i],type:i?'فرعي':'رئيسي',parent:i?ids[i-1]:'',city:'بغداد',phone:'0770000000'+i,active:true,color:['#0284c7','#7c3aed','#059669'][i],support:'',header:names[i],footer:'بطاقات تجريبية غير صالحة للشحن',reprint:5,demo:true}));
 const points=['DEMO-POS1','DEMO-POS2'];
 points.forEach((id,i)=>s.pos.push({id,name:'نقطة '+(i+1),owner:'صاحب نقطة '+(i+1),agent:ids[i?2:0],city:'بغداد',address:'بغداد',phone:'0770000001'+i,email:'',lat:33.3+i*.02,lng:44.43,serial:'DEMO-DEVICE-'+(i+1),model:'جهاز تجريبي',version:'1.0.0',active:true,online:true,lastSeen:new Date().toISOString(),reprint:5,demo:true}));
 const credentials=${JSON.stringify(creds)};
 const usernames=['demo.main','demo.branch','demo.subbranch','demo.pos1','demo.pos2'];
 usernames.forEach((username,i)=>{if(s.users.some(u=>u.username===username))throw Error('اسم حساب العرض مستخدم: '+username);s.users.push({id:'DEMO-U'+i,name:i<3?names[i]:'نقطة '+(i-2),role:i===0?'main':i<3?'sub':'pos',agent:i<3?ids[i]:ids[i===3?0:2],pos:i<3?'':points[i-3],active:true,username,credentials:credentials[i],mustChangePassword:false,twoFactor:false,demo:true})});
 const region=s.governorates.find(g=>g.name==='بغداد');if(region)region.active=true;else s.governorates.push({name:'بغداد',active:true});
 s.providers.push({id:'DEMO-PROVIDER',name:'شركة العرض التجريبي',supplier:'مجهز تجريبي',organizer:'غير محدد',connection:'ملفات',active:true,demo:true});
 s.products.push({id:'DEMO-PRODUCT',name:'بطاقة تجريبية • 5,000 دينار',provider:'DEMO-PROVIDER',face:5000,currency:'IQD',kind:'محلية',active:true,min:4500,limit:10,dailyQty:100,dailyAmount:500000,fields:'serial,pin,expiry',order:1,demo:true});
 ids.forEach(agent=>s.prices.push({id:'DEMO-PRICE-'+agent,agent,product:'DEMO-PRODUCT',price:4800,effective:Masal.day(),region:'الكل'}));
 const engine=new Masal.Engine(s,owner.id);
 const rows=Array.from({length:1000},(_,i)=>({serial:'MASAL-DEMO-'+String(i+1).padStart(4,'0'),pin:'DEMO-NOT-VALID-'+String(i+1).padStart(4,'0'),expiry:'2029-12-31'}));
 engine.approveCashOrder({agent:ids[0],product:'DEMO-PRODUCT',city:'بغداد',supplier:'مجهز تجريبي',cost:4400,expenses:0,loadPrice:4800,postingKey:revision,cashConfirmed:true},rows);
 [[0,ids[0],points[0],480000],[0,ids[0],ids[1],960000],[1,ids[1],ids[2],480000],[2,ids[2],points[1],240000]].forEach(([user,from,to,amount],i)=>new Masal.Engine(s,'DEMO-U'+user).fund(from,to,amount,'voucher',revision+'-fund-'+i));
 s.demoNetworkRevision=revision;
 const previous=localStorage.getItem('masal-v1');if(previous)localStorage.setItem('masal-backup-before-demo-network',previous);
 localStorage.setItem('masal-v1',JSON.stringify(s));d.s=s;
 return d;
};
})();
`;
let app=fs.readFileSync('app.js','utf8');app=app.replace("window.app=createApp(appOptions).mount('#app');",code+"window.app=createApp(appOptions).mount('#app');");fs.writeFileSync('app.js',app);
