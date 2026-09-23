(function(root){
function install(o){
o.computed.createLabel=function(){return this.page==='agents'?(this.managementRole==='owner'?'إضافة وكيل رئيسي':'إضافة وكيل فرعي'):({pos:'إضافة نقطة بيع',users:'إضافة موظف',products:'إضافة فئة',providers:'إضافة مزود'}[this.page]||'إضافة')};
const open=o.methods.openEdit;o.methods.openEdit=function(row){const result=open.call(this,row);if(this.modal?.kind==='edit')this.modal.title=row?'تعديل البيانات':this.createLabel;return result};
o.methods.newSubAgent=function(){this.openEdit();if(this.modal?.kind==='edit'){this.editForm.type='فرعي';this.modal.title='إضافة وكيل فرعي'}};
const actions={computed:{vm(){return this.$root}},template:`<div class="workspace-actions"><button v-if="vm.schema&&vm.can(vm.page+'.create')" class="btn primary" @click="vm.openEdit()">{{vm.tr(vm.createLabel)}}</button><button v-if="vm.page==='agents'&&vm.managementRole==='owner'&&vm.can('agents.create')" class="btn" @click="vm.newSubAgent()">إضافة وكيل فرعي</button><button v-if="['inventory','batches'].includes(vm.page)&&vm.can('import.view')" class="btn primary" @click="vm.go('import')">طلبية جديدة</button><button v-if="vm.page==='sales'&&vm.can('sell.create')" class="btn primary" @click="vm.go('sell')">عملية بيع</button><button v-if="vm.page==='support'&&vm.can('support.create')" class="btn primary" @click="vm.openTicket()">رسالة جديدة</button><details v-if="vm.page!=='reports'&&vm.hasPermissionKey(vm.page+'.export')&&vm.can(vm.page+'.export')" class="workspace-more"><summary aria-label="إجراءات إضافية">⋯</summary><div><button class="btn" @click="vm.exportCurrent()">تصدير البيانات</button></div></details></div>`};
o.components['page-actions']=actions;for(const name of ['operations-panel','workflow-panel']){o.components[name].components??={};o.components[name].components['page-actions']=actions;}
}
root.MasalVisualCleanup={install};
})(globalThis);
