(function(root){
'use strict';
const Node={name:'NetworkBranch',props:['node','tr','money','expanded','searching','canEdit'],emits:['toggle','edit'],template:`
<li class="network-node" :class="{'network-root':node.root,'network-context':node.context}" :style="{'--branch-color':node.color}">
 <article class="network-agent" :class="node.record.type==='رئيسي'?'agent-main':node.nestedSub?'agent-nested':'agent-sub'" :data-agent="node.record.id">
  <button class="network-toggle" @click="$emit('toggle',node.record.id)" :aria-expanded="searching||expanded[node.record.id]!==false" :aria-label="tr('فتح أو إغلاق الفرع')" :disabled="searching||!node.children.length&&!node.points.length">{{searching||expanded[node.record.id]!==false?'−':'+'}}</button>
  <div class="network-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 3h6v5H9ZM3 16h6v5H3Zm12 0h6v5h-6ZM12 8v4M6 16v-4h12v4"/></svg></div>
  <div class="network-identity"><small class="network-type" :class="node.record.type==='رئيسي'?'type-main':node.nestedSub?'type-nested':'type-sub'">{{tr(node.record.type==='رئيسي'?'وكيل رئيسي':node.nestedSub?'فرعي تابع لفرعي':'وكيل فرعي')}}</small><h3>{{node.record.name}}</h3><small v-if="node.record.parent" class="network-parent">{{tr('يتبع')}}: {{$root.nameOf('agents',node.record.parent)}}</small><p>{{node.record.city||'—'}} <span v-if="node.record.phone">· <bdi>{{node.record.phone}}</bdi></span></p></div>
  <span v-if="!node.context" class="network-status" :class="{stopped:!node.record.active}">{{tr(node.record.active?'مفعل':'موقوف')}}</span>
  <div v-if="!node.context" class="network-wallet"><small>{{tr('رصيد المحفظة')}}</small><strong>{{money(node.balance)}} <small>{{tr('د.ع')}}</small></strong></div>
  <button v-if="canEdit&&!node.context" class="btn small" @click="$emit('edit',node.record)">{{tr('تعديل')}}</button>
  <button v-if="!node.context&&$root.canManageNetwork('agents',node.record.id)" class="btn small" @click="$root.openNetworkPermissions('agents',node.record.id)">{{tr('صلاحيات التابع')}}</button><div v-if="!node.context" class="network-counts"><span>{{tr('الفروع المباشرة')}} <b>{{node.directBranches}}</b></span><span>{{tr('نقاط البيع المباشرة')}} <b>{{node.directPoints}}</b></span><span>{{tr('نقاط البيع بكامل الشبكة')}} <b>{{node.totalPoints}}</b></span></div>
 </article>
 <div v-if="searching||expanded[node.record.id]!==false" class="network-descendants" v-network-stem>
  <div v-if="node.children.length" class="network-child-section"><h4>{{tr('الوكلاء الفرعيون')}}</h4><ul class="network-branches"><network-branch v-for="child in node.children" :key="child.record.id" :node="child" :tr="tr" :money="money" :expanded="expanded" :searching="searching" :can-edit="canEdit" @toggle="$emit('toggle',$event)" @edit="$emit('edit',$event)" /></ul></div>
  <div v-if="node.points.length" class="network-point-section"><h4>{{tr('نقاط البيع التابعة مباشرة لهذا الوكيل')}}</h4><div class="network-points"><article v-for="p in node.points" :key="p.id" class="network-point" :data-pos="p.id"><div class="network-point-heading"><span class="network-pos-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 21v-6h6v6"/></svg></span><div><h4>{{p.name}}</h4><small class="network-type type-pos">{{tr('نقطة بيع')}}</small></div><span class="network-status" :class="{stopped:!p.active,offline:p.active&&!p.online}">{{tr(!p.active?'موقوف':p.online?'متصل':'غير متصل')}}</span></div><div class="network-point-balance"><span>{{tr('رصيد المحفظة')}}</span><b>{{money(p.balance)}} {{tr('د.ع')}}</b></div><details><summary>{{tr('بيانات النقطة')}}</summary><dl><div><dt>{{tr('الوكيل')}}</dt><dd>{{node.record.name}}</dd></div><div><dt>{{tr('المحافظة')}}</dt><dd>{{p.city||'—'}}</dd></div><div><dt>{{tr('صاحب النقطة')}}</dt><dd>{{p.owner||'—'}}</dd></div><div><dt>{{tr('الجهاز')}}</dt><dd>{{p.model||'—'}}</dd></div><div><dt>{{tr('رقم الجهاز')}}</dt><dd><bdi>{{p.serial||'—'}}</bdi></dd></div></dl><p>{{p.address||'—'}}</p><p><bdi>{{p.phone||'—'}}</bdi></p></details></article></div></div>
  <p v-if="!node.children.length&&!node.points.length&&$root.networkKind==='all'" class="network-empty">{{tr('لا توجد فروع أو نقاط بيع تابعة لهذا الوكيل')}}</p>
 </div>
</li>`};
const Compact={name:'NetworkOutline',props:['node','tr','expanded','parentName'],emits:['toggle'],template:`
<li class="branch-list-item" :class="{'branch-list-root':node.root,'network-context':node.context}" :style="{'--branch-color':node.color}">
 <button type="button" class="branch-list-row" :class="node.record.type==='رئيسي'?'outline-main':node.nestedSub?'outline-nested':'outline-sub'" :data-outline-agent="node.record.id" :aria-expanded="expanded[node.record.id]!==false" :aria-controls="'branch-list-'+node.record.id" @click="$emit('toggle',node.record.id)">
  <span class="branch-list-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M8 8h2m4 0h2M8 12h2m4 0h2"/></svg></span>
  <span class="branch-list-name"><strong>{{node.record.name}}</strong><small v-if="parentName">{{tr('يتبع')}}: {{parentName}}</small></span><span class="branch-list-type">{{tr(node.record.type==='رئيسي'?'وكيل رئيسي':node.nestedSub?'فرعي تابع لفرعي':'وكيل فرعي')}}</span>
  <svg class="branch-list-chevron" :class="{closed:expanded[node.record.id]===false}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg>
 </button>
 <div :id="'branch-list-'+node.record.id" v-if="expanded[node.record.id]!==false" class="branch-list-content">
  <section v-if="node.children.length" class="outline-group agent-branches"><div class="outline-group-title"><span class="outline-group-dot agents-dot"></span><h4>{{tr('الوكلاء الفرعيون')}}</h4><span class="outline-group-count">{{node.children.length}}</span></div><ul class="outline-agents-list"><network-outline v-for="child in node.children" :key="child.record.id" :node="child" :tr="tr" :expanded="expanded" :parent-name="node.record.name" @toggle="$emit('toggle',$event)"/></ul></section>
  <section v-if="node.points.length" class="outline-group direct-points"><div class="outline-group-title"><span class="outline-group-dot points-dot"></span><h4>{{tr('نقاط البيع المباشرة')}}</h4><span class="outline-group-count">{{node.points.length}}</span></div><ul class="outline-points-list">
   <li v-for="p in node.points" :key="p.id"><div class="branch-list-row outline-pos" :data-outline-pos="p.id"><span class="branch-list-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 21v-6h6v6"/></svg></span><span class="branch-list-name"><strong>{{p.name}}</strong><small>{{tr('تتبع مباشرة')}}: {{node.record.name}}</small></span><span class="branch-list-type">{{tr('نقطة بيع')}}</span></div></li>
  </ul></section>
  <p v-if="!node.children.length&&!node.points.length&&$root.networkKind==='all'" class="branch-list-empty">{{tr('لا توجد فروع أو نقاط بيع')}}</p>
 </div>
</li>`};
function install(o){
 o.directives={...o.directives,'network-stem':{mounted(el){const draw=()=>{const origin=el.getBoundingClientRect().top,anchors=[...el.querySelectorAll(':scope > .network-child-section > .network-branches > .network-node')].map(n=>n.getBoundingClientRect().top-origin+30),points=el.querySelector(':scope > .network-point-section');if(points)anchors.push(points.getBoundingClientRect().top-origin+50);el.style.setProperty('--stem-top',(anchors[0]||0)+'px');el.style.setProperty('--stem-height',(anchors.length>1?anchors.at(-1)-anchors[0]:0)+'px')};el._stemDraw=draw;el._stemObserver=new ResizeObserver(draw);el._stemObserver.observe(el);draw()},updated(el){requestAnimationFrame(()=>{if(el.isConnected)el._stemDraw?.()})},unmounted(el){el._stemObserver?.disconnect()}}};
 o.components={...o.components,NetworkBranch:Node,NetworkOutline:Compact};
 const data=o.data;o.data=function(){return {...data.call(this),treeView:true,networkKind:'all',networkSearch:'',networkExpanded:{},outlineExpanded:{}}};
 Object.assign(o.computed,{
  networkTree(){
   const agents=this.visibleAgents,points=this.visiblePOS,ids=new Set(agents.map(a=>a.id)),seen=new Set();
   const build=(a,top=false)=>{if(seen.has(a.id))return null;seen.add(a.id);const children=agents.filter(x=>x.parent===a.id).map(x=>build(x)).filter(Boolean),pos=points.filter(p=>p.agent===a.id).map(p=>({...p,balance:this.engine.balance(p.id)}));return {record:a,nestedSub:a.type==='فرعي'&&this.s.agents.some(p=>p.id===a.parent&&p.type==='فرعي'),root:top,children,points:pos,balance:this.engine.balance(a.id),directBranches:children.length,directPoints:pos.length,totalPoints:pos.length+children.reduce((sum,n)=>sum+n.totalPoints,0)}};
   const roots=agents.filter(a=>!ids.has(a.parent)).map(a=>build(a,true));for(const a of agents)if(!seen.has(a.id))roots.push(build(a,true));
   const colors=['#168baf','#8661bc','#249275','#bc7e32','#bb5c7e','#527bc4'];
   const colorBranch=(n,color)=>{n.color=color;n.children.forEach(c=>colorBranch(c,color))};
   for(const n of roots){const id=this.engine.main(n.record.id)||n.record.id;let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))>>>0;colorBranch(n,colors[hash%colors.length])}
   const q=this.treeView==='compact'?'':this.networkSearch.trim().toLocaleLowerCase();
   const match=r=>['id','name','city','phone','owner','serial','model'].some(k=>String(r[k]||'').toLocaleLowerCase().includes(q));
   const filter=n=>{if(match(n.record))return n;const children=n.children.map(filter).filter(Boolean),pos=n.points.filter(match);return children.length||pos.length?{...n,children,points:pos}:null};const searched=q?roots.map(filter).filter(Boolean):roots;
   if(this.networkKind==='all')return searched;
   const byKind=n=>{const children=n.children.map(byKind).filter(Boolean),pos=this.networkKind==='pos'?n.points:[],matches=this.networkKind==='main'?n.record.type==='رئيسي':this.networkKind==='sub'?n.record.type!=='رئيسي':this.networkKind==='subsub'?n.nestedSub:false;return matches||children.length||pos.length?{...n,children,points:pos,context:!matches}:null};
   return searched.map(byKind).filter(Boolean);
  }
 });
 Object.assign(o.methods,{toggleOutline(id){this.outlineExpanded[id]=this.outlineExpanded[id]===false},expandOutline(value){this.outlineExpanded=Object.fromEntries(this.visibleAgents.map(a=>[a.id,value]))},toggleNetwork(id){this.networkExpanded[id]=this.networkExpanded[id]===false},expandNetwork(value){this.networkExpanded=Object.fromEntries(this.visibleAgents.map(a=>[a.id,value]))}});
 const change=o.methods.switchUser;o.methods.switchUser=function(){change.call(this);this.networkKind='all';this.networkSearch='';this.networkExpanded={};this.outlineExpanded={}};
}
root.MasalNetworkTree={install};
})(globalThis);
