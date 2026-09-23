from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
def edit(name,fn):
 p=root/name;s=p.read_text(encoding='utf8');p.write_text(fn(s),encoding='utf8')
for f in ['engine.js','operations-engine.js']:
 edit(f,lambda s:s.replace("a.expiry.localeCompare(b.expiry)||a.created.localeCompare(b.created)","a.created.localeCompare(b.created)"))
edit('access.js',lambda s:s.replace("['backup','النسخ الاحتياطي'","['company','الشركة','عرض،تعديل'],\n ['backup','النسخ الاحتياطي'").replace("if(role==='owner')return true;if(detailParents", "if(role==='owner')return true;if(p.module==='company')return key==='company.view';if(key==='prices.policy'&&role==='main')return true;if(detailParents"))
edit('index.html',lambda s:s.replace('<script src="app.js">','<script src="meeting-rules.js"></script><script src="meeting-ui.js"></script><script src="app.js">').replace('<completion-panel ref="completion">','<company-page></company-page><card-designer></card-designer><completion-panel ref="completion">'))
edit('build.cjs',lambda s:s.replace("'dashboard.js','app.js'","'dashboard.js','meeting-rules.js','meeting-ui.js','app.js'"))
edit('app.js',lambda s:s.replace('MasalDashboard.install(appOptions);','MasalDashboard.install(appOptions);\nMasalMeetingUI.install(appOptions);').replace("F('name','اسم العلامة / المزود')","F('name','اسم الشركة')").replace("F('name','العلامة التجارية')","F('name','اسم الشركة')").replace("F('currency','العملة'","F('currency','عملة القيمة الاسمية'").replace("products:'إضافة فئة',providers:'إضافة مزود'","products:'إضافة فئة',providers:'إضافة شركة'").replace('FEFO ثم FIFO','FIFO').replace('الأقرب انتهاءً يُصدر أولًا.','الأقدم دخولًا يُصدر أولًا.'))
edit('workflow-ui.js',lambda s:s.replace('v-for="a in vm.visibleAgents" :value="a.id">{{vm.tr(a.name)}}</option></select></label><label>{{vm.tr("الفئة")}}','v-for="a in mainAgents" :value="a.id">{{vm.tr(a.name)}}</option></select></label><label>{{vm.tr("الفئة")}}').replace('{{vm.tr("السعر بالعملة الأصلية")}}','{{vm.tr("سعر البيع • د.ع")}}').replace('<label>{{vm.tr("سعر الصرف إلى الدينار")}}<input type="number" min="0.01" v-model.number="price.rate"></label>','').replace('vm.money(price.price*price.rate)','vm.money(price.price)'))
edit('operations-ui.js',lambda s:s.replace('<label>{{vm.tr("سعر التحميل المتفق عليه")}}<input type="number" min="0.01" v-model.number="loadPrice"></label>','').replace('<label>{{vm.tr("سعر التحميل")}}<input type="number" v-model.number="f.loadPrice"></label>','<label>{{vm.tr("سعر البيع • د.ع")}}<input :value="e.policyPrice(importAgent,f.product)" readonly></label>').replace('<label>{{vm.tr("نموذج العقد")}}<select v-model="contract"><option value="إعادة بيع">{{vm.tr("إعادة بيع")}}</option><option value="عمولة">{{vm.tr("عمولة")}}</option></select></label>','').replace('<label v-if="contract===\'عمولة\'">{{vm.tr("عمولة الوحدة")}}<input type="number" min="0" v-model.number="commission"></label>',''))
def receipt(s):
 start=s.index('<div class="receipt"',s.index('modal.kind===\'receipt\''))
 end=s.index('<div class="notice no-print"',start)
 return s[:start]+'<meeting-receipt :tx="modal.tx"></meeting-receipt>'+s[end:]
edit('index.html',receipt)
# Remove decorative explanatory copy; keep input labels, warnings and permission selector intact.
edit('index.html',lambda s:s.replace('{{tr(" د.ع. الأقرب انتهاءً يُصدر أولًا.")}}','{{tr(" د.ع")}}').replace('<small>{{tr(x.help)}}</small>',''))
edit('dashboard.js',lambda s:s.replace("const network=['main','sub'].includes(role),known", "const network=['main','sub'].includes(role),known").replace("network?t.credit:t.cost", "t.pricingVersion===2?t.cost:(network?t.credit:t.cost)").replace("network?total-sum('credit'):total-sum('cost')", "sales.reduce((n,t)=>n+t.total-(t.pricingVersion===2?t.cost:(network?t.credit:t.cost)),0)"))
# Reporting must respect the support conversation's actual participants.
edit('reports.js',lambda s:s.replace("s.tickets.filter(r=>allowedAgent(r.agent)&&period(r.time))", "s.tickets.filter(r=>(!e.supportVisible||e.supportVisible(r))&&allowedAgent(r.agent)&&period(r.time))").replace("s.tickets.filter(r=>allowedAgent(r.agent)).flatMap(t=>t.replies.filter(r=>period(r.time))", "s.tickets.filter(r=>(!e.supportVisible||e.supportVisible(r))&&allowedAgent(r.agent)).flatMap(t=>t.replies.filter(r=>period(r.time)&&(!r.audience||r.audience.includes(e.supportIdentity())))"))
css='''
/* New panels reuse the existing theme and control dimensions. */
.company-page,.company-slide-edit{display:grid;gap:14px}.company-page .actions{flex-wrap:wrap}.company-slider>img{display:block;width:100%;max-height:340px;object-fit:contain;border-radius:12px}.company-about{white-space:pre-wrap}.receipt-logo{max-width:85px;max-height:60px}.receipt-art{max-width:100%;max-height:160px}.receipt-block{padding:10px 0;border-bottom:1px dashed #ccd5df}.receipt-block:last-child{border:0}.receipt-block> b{display:block}.receipt-block small{display:block}.company-slide-edit{padding:12px 0;border-bottom:1px solid var(--border)}
.main .content:not([data-page="permissions"]) .page-intro{display:none}
'''
edit('styles.css',lambda s:s+css)
print('Meeting changes wired')
