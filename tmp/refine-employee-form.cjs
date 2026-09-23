const fs=require('fs');let h=fs.readFileSync('index.html','utf8');
h=h.replace('<select v-if="f.options" v-model="editForm[f.key]"',`<div v-if="f.type==='agentScope'" class="scope-options"><label v-for="a in visibleAgents" class="inline-check"><input type="checkbox" :checked="(editForm.assignedText||'').split(',').includes(a.id)" @change="toggleAssignedAgent(a.id,$event.target.checked)">{{a.name}}</label></div><select v-else-if="f.options" v-model="editForm[f.key]"`);
// No delegation of full-workspace backup access: it includes every branch and raw card codes.
h=h.replace(':disabled="!can(p.key)"',':disabled="!can(p.key)||p.module===\'backup\'"');
fs.writeFileSync('index.html',h);
let a=fs.readFileSync('app.js','utf8');a=a.replace("['reports','التقارير والأرباح','↗','سجل المبيعات والتكلفة والربح الإجمالي']","['reports','مركز التقارير الشامل','↗','تقارير تفصيلية للمبيعات والمخزون والمحافظ والشبكة والتشغيل']");a=a.replace("'مصفوفة الصلاحيات وعزل فروع شجرة الوكلاء'","'إدارة دقيقة لصلاحيات كل موظف ونطاق بياناته'");fs.writeFileSync('app.js',a);
