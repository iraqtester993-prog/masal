(function(root){
'use strict';
function batchActionAllowed(s,b,action){
 if(!b||['Exported','Cancelled by Reversal'].includes(b.status))return false;
 const cards=s.cards.filter(c=>c.batch===b.id);
 if(action==='quarantine')return cards.some(c=>c.status==='Available');
 if(action==='cancel')return cards.length>0&&cards.every(c=>['Available','Quarantined'].includes(c.status))&&!s.claims.some(c=>c.batch===b.id);
 return false;
}
const originalBatchAction=root.Masal.Engine.prototype.batchAction;
root.Masal.Engine.prototype.batchAction=function(id,action){
 const b=this.s.batches.find(b=>b.id===id);
 if(b&&['Exported','Cancelled by Reversal'].includes(b.status))throw Error('الدفعة مصدّرة أو ملغاة؛ لا يمكن حجرها أو إلغاؤها');
 return originalBatchAction.call(this,id,action);
};
function install(o){
 o.methods.canBatchAction=function(b,action){return this.can(action==='cancel'?'inventory.cancel':'inventory.quarantine')&&batchActionAllowed(this.s,b,action)};
 const data=o.data;o.data=function(){return {...data.call(this),inventoryAgent:''}};
 o.computed.inventoryAgents=function(){return this.visibleAgents.filter(a=>a.type==='رئيسي').slice().sort((a,b)=>a.name.localeCompare(b.name,'ar'))};
 const batches=o.computed.batchRows;o.computed.batchRows=function(){const rows=batches.call(this);if(!['inventory','batches'].includes(this.page))return rows;return rows.filter(b=>!this.inventoryAgent||b.agent===this.inventoryAgent).slice().sort((a,b)=>this.nameOf('agents',a.agent).localeCompare(this.nameOf('agents',b.agent),'ar'))};
 o.computed.inventoryCards=function(){const ids=new Set(this.batchRows.map(b=>b.id));return this.visibleCards.filter(c=>ids.has(c.batch)&&(!this.inventoryAgent||c.agent===this.inventoryAgent))};
 o.computed.inventoryAvailableCards=function(){return this.inventoryCards.filter(c=>c.status==='Available'&&c.expiry>Masal.day())};
 const change=o.methods.switchUser;o.methods.switchUser=function(...args){this.inventoryAgent='';return change.apply(this,args)};
 o.methods.selectInventoryAgent=function(){this.dashboardFilter=null};
 const panel=o.components['operations-panel'],invoices=panel.computed.invoices;panel.computed.invoices=function(){const rows=invoices.call(this);if(!['inventory','batches'].includes(this.page))return rows;const ids=new Set(this.vm.batchRows.map(b=>b.id));return rows.filter(i=>ids.has(i.batch)&&(!this.vm.inventoryAgent||i.agent===this.vm.inventoryAgent))};
}
root.MasalInventoryUI={install};
})(globalThis);
