// Read-only inspection of project files; writes only the generated HTML catalog.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),target='docs/FILE-CATALOG.html';
const descriptions={
 'index.html':'مدخل الموقع على GitHub Pages؛ هيكل واجهة Vue وروابط السكربتات والتنسيقات.',
 'masal.html':'نسخة التشغيل المحلية المجمّعة؛ تتضمن الواجهة والبرمجة والتنسيقات والخطوط والمكتبات داخل ملف واحد. ليست قاعدة بيانات حساباتك.',
 'README.md':'دليل التشغيل الحالي؛ خريطة المجلدات والبناء والاختبارات والنشر وحدود النسخة المحلية.',
 '.gitignore':'قواعد استبعاد الملفات المحلية والمؤقتة والمراجع من إضافتها تلقائيًا إلى Git؛ لا تمسح ملفات متتبعة سابقًا.',
 '.nojekyll':'ملف علامة فارغ لتعطيل معالجة Jekyll عند نشر الموقع كملفات ثابتة.',
 '_config.yml':'قائمة استبعادات احتياطية لإعداد Jekyll؛ ليست حماية وصول عند تفعيل .nojekyll.',
 'desktop.ini':'إعدادات عرض المجلد في Windows؛ ليس من مكونات التطبيق.',
 'access.js':'كتالوج الصلاحيات وأدوار الحسابات والتحقق من النطاق ووراثة القيود وحفظ المنح.',
 'account-time-controls.js':'قواعد وقت الحساب والجلسة والخمول؛ التحقق من انتهاء المدة وتسجيل السبب.',
 'activity-notifications.js':'تحويل أحداث الحسابات والعمليات إلى إشعارات للمستلمين ضمن النطاق.',
 'agent-products.js':'ربط الفئات المسموحة بالوكلاء والتحقق من ظهورها وإتاحتها في التسعير والبيع.',
 'app.js':'تهيئة تطبيق Vue والتنقل والنوافذ والنماذج وتحميل الحالة المحلية وحفظها وربط إضافات النظام.',
 'audit-details.js':'عرض تفاصيل السجلات وتسميات حقولها بشكل مفهوم بدل البيانات الخام.',
 'audit-fixes.js':'تصحيحات وتوسعات مشتركة للتمويل والبيع والدفعات والمطالبات والاستبدال والتعويض والتحقق من التكرار.',
 'card-fields.js':'تعريف حقول البطاقة مثل PIN وSerial وExpiry وسياسة الحقول المطلوبة وتوحيدها.',
 'card-layout.js':'تصميم البطاقة وترتيب النصوص والصور ووراثة تصميم الشركة وتخصيص الوكيل لكل فئة.',
 'cash-orders.js':'اعتماد طلبيات المخزون المحمّلة وربط قيمتها وسجلاتها؛ واجهة إدخال ومراجعة الطلبيات.',
 'categories-ui.js':'واجهة إدارة الفئات وحقولها ومحافظاتها وجدولها وأوامر العرض والتعديل.',
 'company-public-runtime.js':'ملف مولّد يضع مصدر مكتبة Vue داخل متغير نصي لتشغيل نافذة موقع الشركة المستقلة؛ لا يعدّل يدويًا.',
 'company-site.js':'تحرير أقسام موقع الشركة وتجهيز البيانات العامة وفتح نافذة العرض المستقلة والتواصل معها.',
 'completion-engine.js':'توسعات الجلسات والتحقق وسياسات الأمان وكلمات المرور ومسارات التنبيهات في النسخة المحلية.',
 'completion-ui.js':'نماذج واجهة الأمان والجلسة وكلمة المرور وتحديات التحقق المرتبطة بمحرك الإكمال.',
 'completion-locales.js':'ترجمات إضافية لواجهات الأمان والإكمال بالعربية والإنجليزية والكردية.',
 'daily-print.js':'احتساب الاستخدام والحدود اليومية للطباعة والبيع وتخصيص الفئة أو شبكة الحسابات.',
 'dashboard.js':'مؤشرات لوحة التحكم ونوافذ تفاصيلها وروابط التنقل إلى السجلات المرتبطة.',
 'engine.js':'محرك بيانات وقواعد الأعمال الأساسي: بيانات التجربة، الحسابات، المخزون، البيع والطباعة والمطالبات والتدقيق.',
 'enhancements.js':'تحسينات مشتركة لواجهة التطبيق وتقارير التفاصيل والتحقق من المدخلات والإجراءات والصلاحيات.',
 'excel-export.js':'كاتب XLSX محلي: تجميع XML وZIP والخلايا والأعمدة لتصدير الجداول والتقارير.',
 'feature-updates.js':'توسعات مشتركة للنماذج والمرفقات واكتشاف المدخلات وربط تحديثات الواجهة.',
 'form-lifecycle.js':'إدارة دورة حياة النماذج؛ إعادة ضبطها بعد نجاح العملية وليس عند فشل التحقق.',
 'funding-rules.js':'قواعد التمويل والتحويل والأرصدة والاستثناءات والتنفيذ المجمع والاسترجاع؛ حماية اتساق المعاملة.',
 'import-reader.js':'قراءة ملفات الاستيراد النصية والجداول وملفات XLSX وتحويلها إلى صفوف قابلة للتحقق.',
 'inventory-management.js':'إدارة بطاقات الدفعة والتالف وإلغاء المتبقي واستعادته وبيانات المخزون وطلبات التصدير.',
 'inventory-ui.js':'واجهة عرض المخزون والدفعات والتحقق من إتاحة إجراءاتها.',
 'locales.js':'قاموس الترجمة الأساسي وآلية ترجمة النصوص وتنسيق التاريخ مع إبقاء بيانات المستخدم الأصلية.',
 'login-screen.js':'واجهة تسجيل الدخول وتهيئتها وتذكر اسم الدخول محليًا.',
 'management-locales.js':'قاموس إضافي لمصطلحات الإدارة والحسابات والمخزون.',
 'meeting-rules.js':'قواعد أعمال أضيفت وفق الاجتماعات: التسعير والمخزون والحجز والبيع والدعم وإيقافات العمليات.',
 'meeting-ui.js':'تعديلات الواجهات والتسميات ومسارات العمل المستخلصة من مراجعات الاجتماعات.',
 'money-inputs.js':'تنظيف وتنسيق حقول المبالغ والفواصل والتحقق من تمثيل القيمة أثناء الإدخال.',
 'multi-orders.js':'طلبيات متعددة الملفات والفئات؛ ربط مرجع الفئات، المعاينة والاعتماد ورفض الصفوف وتصديرها.',
 'network-accounts.js':'إنشاء وتعديل حسابات شبكة الوكلاء والنقاط وربط بيانات الدخول وضبط منح الصلاحيات.',
 'network-archive.js':'أرشفة حسابات الشبكة والتحقق من الصلاحية واستبعاد المؤرشف من الاستخدامات النشطة.',
 'network-tree.js':'مكونات شجرة الوكلاء والفروع ونقاط البيع وعرض العلاقات والأرصدة والتوسيع والبحث.',
 'operations-engine.js':'توسعات محرك العمليات: محافظ الخدمات والتحويلات والحجوزات والاستيراد واستثناءات الطباعة.',
 'operations-ui.js':'لوحات ونماذج وجداول العمليات؛ المحافظ والمخزون والبيع والمطالبات والتكاملات وغيرها.',
 'operations-locales.js':'ترجمة عناوين وحقول وحالات العمليات.',
 'order-parser.js':'تحليل صيغ ملفات الطلبيات وتواريخها ورموزها وربطها بمرجع الفئة؛ توليد/توحيد الصفوف.',
 'order-sources.js':'إدارة مصادر الطلبيات وربط المصدر بالشركة والتحقق منه عند الاستيراد.',
 'password-admin.js':'طلب إعادة تعيين كلمة المرور والتحقق وإدخال الكلمة وتأكيدها؛ رمز OTP الحالي تجريبي وليس ربط واتساب فعليًا.',
 'pos-register.js':'سجل نقاط البيع وأعمدته مثل الاسم التجاري وصاحب المكتب وتاريخ الإنشاء والاتصال والهاتف.',
 'price-editor.js':'معاينة واعتماد تعديل الأسعار الفردي والجماعي ضمن صلاحيات الوكيل والفئات المتاحة.',
 'print-escalation.js':'تصعيد طلبات إعادة الطباعة إلى الجهة الأعلى وتحديد المستلم وصلاحية الاعتماد.',
 'print-policies.js':'قواعد الطباعة والتكرار والفاصل الزمني وعدد البطاقات ومراجعة جاهزية العملية.',
 'print-policy-scopes.js':'قواعد طباعة مخصصة حسب الحسابات والفئات وأولوية القواعد وتفعيلها وتعطيلها.',
 'print-scope-picker.js':'واجهة بحث واختيار الحسابات التي تطبق عليها قواعد الطباعة.',
 'providers-ui.js':'واجهة سجل الشركات/المزودين وعرضها وإدارتها.',
 'regions.js':'قوائم المحافظات وحالات تفعيلها واستخدامها في النماذج والفلاتر.',
 'report-groups.js':'تصنيف تقارير النظام إلى المجموعات الرئيسية وبطاقاتها وروابط تفاصيل التقارير.',
 'reports.js':'تجميع بيانات التقارير ومؤشراتها وفلاترها مع مراعاة الصلاحيات والنطاق.',
 'scope-filters.js':'تحديد الوكلاء والنقاط والمحافظات والفئات المسموحة في الفلاتر والتحقق من النطاق.',
 'searchable-selects.js':'تحويل قوائم الاختيار إلى قوائم قابلة للبحث مع تحكم لوحة المفاتيح وتحديد الموضع.',
 'security-controls.js':'إيقاف واستئناف الحسابات أو العمليات حسب نطاق وسياسات إدارية.',
 'seller-accounts.js':'تحديد الحساب البائع والتحقق من صاحب العملية وربط البيع والحجز بحساب الشبكة الصحيح.',
 'simple-notifications.js':'إرسال الإشعارات وتحديد مستلميها ضمن الشبكة وربط أحداث الدعم بها.',
 'simple-wallets.js':'طلبات التمويل المبسطة والموافقة والرفض والتمويل المباشر وسجلها؛ دمجها في تبويب المحافظ.',
 'staff-model.js':'نماذج الموظفين وملفات الصلاحيات وحفظ الحسابات والتحقق من كلمات المرور.',
 'staff-ui.js':'واجهة الموظفين وملفات الصلاحيات وتفاصيل الحساب وتعديل اسم مدير النظام.',
 'support-broadcast.js':'رسائل دعم عامة أو مخصصة للمستخدمين أو فئات الشبكة وفق الصلاحيات.',
 'support-chat.js':'واجهة المحادثات والرسائل غير المقروءة وأرقام الدعم وقراءة الرسائل.',
 'support-routing.js':'تحديد جهة الدعم المناسبة حسب علاقة الحسابات والتحقق من عرض المحادثات والرد عليها.',
 'table-pagination.js':'ترقيم صفحات الجداول وعدد الصفوف وأزرار التنقل وتحديثها.',
 'ui-localization.js':'ترجمة قوالب الواجهة والمكونات والعناوين والحقول مع حماية أسماء المستخدمين وقيم البيانات.',
 'user-map.js':'خريطة المستخدمين وفلترتهم وحالتهم ومواقعهم باستخدام Leaflet وخريطة شوارع خارجية.',
 'visual-cleanup.js':'تنظيف تسميات وعناصر الواجهة المشتركة وتوحيد عرضها.',
 'wallet-filters.js':'فلترة حسابات المحافظ وشبكتها وأرصدة الحسابات وتجميع المؤشرات.',
 'workflow-engine.js':'قواعد سير العمل للتسعير والحدود والتنبيهات وتصدير الدفعات وتسليم التمويل وإلغاء الحجز.',
 'workflow-ui.js':'نماذج سير العمل المرتبطة بالتسعير والقيود والتصدير والتمويل.',
 'agent-products.css':'تنسيقات اختيار الفئات المسموحة للوكيل والبحث والقوائم المرتبطة.',
 'company-profile.css':'تصميم موقع الشركة وأقسامه والسلايدر والواجهة المتجاوبة.',
 'layout.css':'توزيع الصفحة والقوائم والشريط العلوي والتكيف مع قياسات الشاشات.',
 'management.css':'تنسيق شاشات الإدارة والحسابات والصلاحيات والمحافظ وعناصرها.',
 'network-tree.css':'تصميم شجرة الوكلاء والفروع وبطاقات الشبكة والروابط البصرية.',
 'operations.css':'تنسيقات أساسية لنماذج وجداول وحالات العمليات.',
 'polish.css':'تحسينات بصرية للتباعد والأزرار والعناصر المشتركة.',
 'reference-identity.css':'ملف الهوية البصرية والتعديلات التفصيلية؛ الكروت والجداول والتبويبات والنهاري والليلي والتجاوب.',
 'styles.css':'الأنماط الأساسية وتعريف الخطوط والهيكل والقوائم والنماذج.',
 'support-chat.css':'تصميم محادثات الدعم وفقاعات الرسائل وحالات القراءة.',
 'theme.css':'متغيرات الألوان والخلفيات والخطوط للوضعين النهاري والليلي.',
 'tools/build.cjs':'أداة بناء masal.html من index.html ومصادر src والأصول؛ تولّد بيانات الخرائط ونسخة Vue الخاصة بموقع الشركة.',
 'tools/check-project.cjs':'فحص هيكل المجلدات وروابط السكربتات والتنسيقات والخطوط وملف .nojekyll.',
 'tools/build-file-catalog.cjs':'مولّد هذا الدليل؛ يقرأ أسماء الملفات وأحجامها ومؤشرات محتواها ويكتب تقرير HTML دون تغيير ملفات التطبيق.',
 'docs/FILE-CATALOG.html':'دليل الملفات الحالي؛ فهرس كل ملف ووظيفته وملخص محتواه مع قسم منفصل لملفات Git.',
 'tests/setup.cjs':'تهيئة الاختبارات: تثبيت مجلد العمل على جذر المشروع وإنشاء مجلدات نواتج الفحص المؤقتة.',
 'test-credit-fixture.cjs':'بيانات ومحرك مساعد للاختبارات؛ يهيّئ أرصدة تجريبية للنقاط ثم يصدّر المحرك المجهز.',
 'ARCHITECTURE.md':'توثيق بنية النظام ومسار الانتقال من نموذج محلي إلى نظام بخادم.',
 'DESIGN.md':'توثيق التصميم والهوية وعناصر الواجهة.',
 'MANAGEMENT-GUIDE.md':'دليل إدارة الحسابات والإعدادات ومسارات العمل؛ قد يعكس مرحلة سابقة.',
 'ORGANIZATION-2026-09-29.md':'محضر النسخ الاحتياطي وترتيب الملفات والتنظيف ونتائج الفحص وحدوده.',
 'PROJECT-STRUCTURE.md':'دليل مواقع المصادر حسب الوحدات ومحتويات المجلدات وطريقة التسليم.',
 'README-legacy.md':'نسخة تاريخية من دليل التشغيل القديم، محفوظة للمرجعية وليست تعليمات المسارات الحالية.',
 'TEST-RESULTS.md':'نتائج اختبارات موثقة سابقًا؛ وجودها لا يعني أن الاختبارات أُعيد تشغيلها اليوم.',
 'REQUIREMENTS.md':'متطلبات النظام وحالة الوحدات والحدود الموثقة.',
 'شرح-تجربة-تصدير-البطاقات.md':'خطوات تجربة تصدير البطاقات وفك التشفير.',
 'vue.global.prod.js':'مكتبة Vue الموزعة للإنتاج محليًا، يستخدمها التطبيق لعرض المكونات وربط البيانات.',
 'leaflet.js':'مكتبة Leaflet لعرض الخريطة والتعامل مع العلامات والطبقات.',
 'leaflet.css':'تنسيقات عناصر مكتبة الخرائط وأزرارها وطبقاتها.',
 'map-countries.geojson':'بيانات جغرافية للبلدان؛ مدخل بناء بيانات الخريطة.',
 'map-places.geojson':'بيانات جغرافية للأماكن والتسميات؛ مدخل بناء بيانات الخريطة.',
 'map-countries.js':'نسخة JavaScript مولّدة من بيانات البلدان لتحميلها في المتصفح.',
 'map-places.js':'نسخة JavaScript مولّدة من بيانات الأماكن لتحميلها في المتصفح.',
 'cairo-regular.ttf':'خط Cairo للنصوص العادية؛ ملف خط ثنائي.',
 'cairo-bold.ttf':'خط Cairo للعناوين والنصوص العريضة؛ ملف خط ثنائي.',
 'cairo-black.ttf':'خط Cairo بالأوزان الثقيلة؛ ملف خط ثنائي.',
 'jetbrains-mono.ttf':'خط ثابت العرض للأرقام والحقول التقنية؛ ملف خط ثنائي.',
 'VUE-LICENSE.txt':'نص ترخيص Vue؛ يحتفظ به عند توزيع المكتبة.',
 'leaflet-LICENSE.txt':'نص ترخيص Leaflet؛ يحتفظ به عند توزيع المكتبة.',
 'CAIRO-OFL.txt':'ترخيص خط Cairo؛ يحتفظ به عند توزيع الخط.',
 'JETBRAINS-OFL.txt':'ترخيص خط JetBrains Mono؛ يحتفظ به عند توزيع الخط.',
 'references/New Text Dسocument.txt':'مرجع ربط رموز الملفات بفئات البطاقات؛ أصل مرجعي وليس ملف مخزون للاستيراد.',
 'references/requirements-extracted.txt':'نص المتطلبات المستخرج من الوثائق الأصلية، محفوظ كمرجع.',
 'references/eVouchersDownload_2022-01-04 12 06.txt':'ملف بطاقات أصلي قدّمه المستخدم لفهم صيغة الاستيراد؛ لا تعرض رموزه في دليل عام.',
 'references/ك5.xlsx':'مصنف Excel أصلي قدّمه المستخدم كعينة لصيغة البطاقات؛ محتوى الخلايا لم يُعدّ تحليله في هذا الجرد.',
};
const testTopics=`access-reports|صلاحيات التقارير
account-time-scopes|نطاقات وقت الحساب والجلسة
activity-notifications|إشعارات الأنشطة
agent-category-image|صورة الفئة الخاصة بالوكيل
agent-products|الفئات المسموحة للوكيل
agent-suspension|إيقاف الوكيل
audit-fixes|تصحيحات التدقيق والعمليات
auto-serial|توليد السيريال تلقائيًا
bulk-funding-dialog|نافذة معاينة التمويل المتعدد
bulk-selection|الاختيار الجماعي
card-fields|حقول البطاقة المطلوبة
category-export|تصدير الفئات
category-order-limit|حدود طلب الفئة
compact-withdrawal|واجهة السحب والتصدير المختصرة
company-theme|موقع الشركة والنهاري والليلي
completion|محرك الأمان والإكمال
completion-ui|واجهة الأمان والإكمال
daily-categories|الحدود اليومية حسب الفئات
daily-limit|الحد اليومي
daily-print|احتساب الطباعة اليومية
dashboard-cleanup|تنظيف لوحة التحكم
demo-password-reset|إعادة كلمة المرور والتحقق التجريبي
engine|قواعد المحرك الأساسية
exceptions-toolbar|شريط استثناءات الطباعة
extra-sample-formats|عينات صيغ الاستيراد الإضافية
funding-recovery|استرجاع التمويل
handoff|مسارات تسليم النسخة وتجربة الحسابات
inventory-actions|إجراءات المخزون
inventory-downloads|تنزيل وتصدير المخزون
inventory-management|إدارة المخزون
layout|تخطيط الواجهة
local-and-pages|التشغيل المحلي ومحاكاة GitHub Pages
locales|قواميس اللغات
location-required|إلزام تفعيل الموقع
management-ui|واجهة الإدارة
map-dialog|نافذة تفاصيل الخريطة
map-selection-presence|اختيار المستخدم وحالة الاتصال على الخريطة
money-inputs|حقول المبالغ
multi-orders|الطلبيات متعددة الملفات
network-archive|أرشفة حسابات الشبكة
network-image|صور حسابات الشبكة
network-login-email|بريد دخول حسابات الشبكة
network-tree|شجرة الوكلاء والفروع
notice-detail|تفاصيل الإشعار
operations|محرك العمليات
operations-ui|واجهة العمليات
order-file-count|عدد ملفات الطلبية
order-form-ui|واجهة إضافة طلبية
order-history|سجل الطلبيات
order-reference|ربط رموز مرجع الفئات
order-samples|عينات الملفات الأصلية
order-sources|مصادر الطلبيات
owner-account-details|تفاصيل حساب مدير النظام
owner-network-grants|منح المدير صلاحيات الشبكة
owner-prices|تسعير المدير والوكيل
owner-visibility|نطاق رؤية المدير
pages-config|إعدادات GitHub Pages وروابط الملفات
password-admin|إدارة إعادة كلمة المرور
permission-cards|بطاقات الصلاحيات
permission-checkboxes|منح وسحب الصلاحيات بالمربعات
pos-login-details|بريد الدخول في تفاصيل النقطة
pos-register|أعمدة سجل النقاط
price-editor|التعديل الفردي والجماعي للأسعار
print-policies|قواعد الطباعة
print-rule-reactivation|إعادة تفعيل قاعدة الطباعة
print-scope-picker|اختيار نطاق الطباعة
profile-display-names|أسماء الحسابات المعروضة
real-map|الخريطة الفعلية
reference-catalog|كتالوج مرجع الفئات
rejected-import-export|تصدير صفوف الاستيراد المرفوضة
report-center|مركز التقارير
report-destination|انتقال التقرير إلى التفاصيل
report-groups|مجموعات التقارير
report-night-theme|تقارير الوضع الليلي
report-toolbar|شريط أدوات التقرير
sample-order-files|عينات ملفات الطلبيات
saved-scope-summary|ملخص النطاق المحفوظ
scope-filters|فلاتر النطاق
scope-pagination|النطاق وترقيم الصفحات
sidebar-groups|مجموعات القائمة الجانبية
sidebar-hover|فتح السايدبار بالمرور
sidebar-layer|طبقات السايدبار
simple-card-design|تصميم البطاقة المبسط
simple-claim-settlement|استبدال البطاقات والتعويض
simple-role-card-design|تصميم البطاقة حسب الدور
simple-wallets|قواعد التمويل والمحافظ المبسطة
staff-profiles|ملفات صلاحيات الموظفين
staff-ui|واجهة الموظفين
support-broadcast|رسائل الدعم العامة والمخصصة
support-chat|محادثات الدعم وأرقام الهاتف
support-inline|نموذج الدعم داخل الصفحة
theme|النهاري والليلي
ui|الواجهة الأساسية
ui-extended|مسارات الواجهة الموسعة
ui-localization|ترجمة الواجهة وحماية قيم البيانات
unified-center|توحيد مركز العرض
user-map|مستخدمو الخريطة
users-card-spacing|مسافات كروت المستخدمين
users-layout|تخطيط المستخدمين
wallet-summary|ملخص أرصدة المحافظ
wallet-theme-parity|تدرج كروت المحافظ حسب الوضع
wallet-toolbar-laptop|ترتيب شريط المحافظ على اللابتوب
wallet-visible-services|التبويبات والخدمات وطلبات التمويل
workflow|قواعد سير العمل
workflow-ui|واجهة سير العمل
xlsx-reader|قراءة XLSX`;
const topics=Object.fromEntries(testTopics.split('\n').map(r=>r.split('|')));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=[];
function walk(dir=''){
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=(dir?dir+'/':'')+entry.name;
  if(entry.isDirectory()){walk(rel);continue}if(!entry.isFile())continue;
  const size=fs.statSync(path.join(root,rel)).size;
  rows.push(describe(rel,size));
 }
}
function describe(rel,size){
 const name=path.basename(rel),ext=path.extname(name),group=rel.includes('/')?rel.split('/')[0]:'الجذر';
 let role=descriptions[rel]||descriptions[name]||'',content='',status='مرجع/أداة مساعدة';
 if(group==='.git'){
  status='سجل Git — لا تحذفه من مشروع التطوير';
  role=rel.includes('/objects/')?'كائن داخلي مضغوط من تاريخ Git، أو فهرس/حزمة كائنات؛ لا يشغله التطبيق.':rel.includes('/logs/')?'سجل محلي لتحركات مراجع وفروع Git.':rel.includes('/hooks/')?'نموذج خطاف Git؛ ملفات .sample لا تعمل تلقائيًا باسمها الحالي.':rel.includes('/refs/')?'مرجع Git يشير إلى حالة فرع أو وسم.':name==='index'?'فهرس Git الثنائي للملفات المرحّلة.':name==='config'?'إعدادات المستودع المحلي والاتصال بالمستودع البعيد.':'بيانات إدارية داخلية خاصة بمستودع Git.';
  content='فُهرس الاسم والحجم فقط؛ لم تُفك كائنات التاريخ أو تُعرض إعدادات قد تحتوي معلومات خاصة.';
 }else if(group==='tests'){
  status='اختبار/تطوير — غير مطلوب لفتح التطبيق';
  if(!role)role='اختبار آلي لـ '+(topics[name.replace(/^test-/,'').replace(/\.cjs$/,'')]||name)+'؛ يحتوي تهيئة وحالات تحقق، وقد يولّد صورًا ونتائج مؤقتة.';
 }else if(group==='tmp'){status='ناتج مؤقت — غير مطلوب للتشغيل';role='ناتج فحص محلي محفوظ من الاختبارات؛ ليس صورة مستخدمة داخل التطبيق.';content='ملف '+ext+' باسم يحدد الاختبار أو الوضع المصوّر؛ الصور لم يُعد تفسير تفاصيلها في هذا الجرد.';}
 else if(group==='references'){
  status='مرجع أصلي/بحث — محفوظ محليًا ومستبعد من الرفع';
  if(!role)role=rel.includes('transcript')||rel.includes('meeting')?'مرجع محفوظ من تحليل الاجتماعات أو تفريغها؛ يستخدم لفهم متطلبات النظام وليس للتشغيل.':'مادة بحث أو نتيجة مراجعة محفوظة من الأرشيف القديم، وليست جزءًا من تشغيل الموقع.';
  content='مرجع بصيغة '+ext+'؛ لم تُنسخ محتوياته الخام أو بيانات البطاقات إلى هذا الدليل.';
  if(['.md','.txt','.json','.jsonl'].includes(ext)){
   const raw=fs.readFileSync(path.join(root,rel),'utf8');
   content+=' عدد الأسطر: '+raw.split(/\r?\n/).length+'.';
   if(ext==='.md')content+=' عناوينه: '+raw.split(/\r?\n/).filter(l=>/^#{1,3} /.test(l)).slice(0,5).join('؛ ');
   if(ext==='.json'||ext==='.jsonl')try{const data=JSON.parse((ext==='.jsonl'?raw.split(/\r?\n/).find(l=>l.trim()):raw).replace(/^\uFEFF/,''));content+=Array.isArray(data)?' البنية: قائمة سجلات.':' أسماء الحقول العليا: '+Object.keys(data||{}).slice(0,12).join('، ');}catch{content+=' تنسيق بحثي/تفريغ نصي؛ لم يتحقق محلل JSON من بنيته.';}
  }
 }else if(group==='samples'){
  status='عينة تجربة — ليست مخزونًا تلقائيًا';
  role=name==='build.mjs'?'سكربت توليد عينات تجريبية لصيغ الاستيراد.':name==='اقرأني.txt'?'تعليمات استخدام عينات الاستيراد.':'ملف عينة لاختبار استيراد البطاقات؛ لا يدخل المخزون إلا عند رفعه واعتماده في النظام.';
  content='الصيغة '+ext+(ext==='.xlsx'?' (مصنف Excel؛ لم تُفحص خلاياه في هذا الجرد).':'؛ اسم الملف يحدد الفئة أو السيناريو المقصود، وليس شهادة بصحة كل سجل.');
 }else if(group==='src'){status=name==='company-public-runtime.js'?'مورد تشغيل مولّد أثناء البناء':'مصدر تشغيل — احتفظ به';}
 else if(group==='assets'){status=/LICENSE|OFL/.test(name)?'ترخيص — يحتفظ به عند التوزيع':/map-.*\.js$/.test(name)?'مورد خريطة مولّد':'أصل تشغيل/بناء — احتفظ به';}
 else if(group==='docs'){status='توثيق — ليس كود تشغيل';}
 else if(group==='tools'){status='أداة تطوير/بناء — لا تعمل ضمن صفحة المستخدم';}
 else if(['index.html','masal.html'].includes(rel))status='صفحة تشغيل';
 if(!role)role='ملف مساعد؛ لم يُحدد له وصف تفصيلي يدوي، راجع مؤشرات المحتوى أدناه.';
 const inspect=rel!==target&&rel!=='masal.html'&&name!=='company-public-runtime.js'&&(['src','tests','tools','docs'].includes(group)||rel==='README.md');
 if(inspect&&['.js','.cjs','.mjs','.css','.md'].includes(ext)){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const heads=text.split(/\r?\n/).filter(l=>/^#{1,3} /.test(l)).slice(0,7);
  const methods=[...new Set([...text.matchAll(/(?:function\s+|P\.)([A-Za-z_][A-Za-z0-9_]*)/g)].map(m=>m[1]))].slice(0,12);
  const checks=[...text.matchAll(/(?:console\.log|test|pass)\(['"]([^'"\n]{8,240})/g)].map(m=>m[1]).slice(0,3);
  const selectors=ext==='.css'?[...text.matchAll(/(?:^|\})([^{}]{2,180})\{/g)].map(m=>m[1].trim()).slice(0,5):[];
  content='عدد الأسطر: '+text.split(/\r?\n/).length+'. '+(heads.length?'العناوين: '+heads.join('؛ '):methods.length?'أمثلة من الدوال: '+methods.join('، '):checks.length?'حالات موثقة في الكود: '+checks.join('؛ '):selectors.length?'أمثلة محددات التنسيق: '+selectors.join('؛ '):'يتضمن '+(ext==='.css'?'قواعد تنسيق وتجاوب.':'تعريفات/قوالب أو بيانات مرتبطة بالوظيفة المذكورة.'));
  if(group==='tests'&&checks.length)content+=' حالات الفحص المكتوبة: '+checks.join('؛ ');
 }
 if(!content)content=role;
 return {path:rel,size,group,role,content,status};
}
walk();
if(!rows.some(r=>r.path===target))rows.push(describe(target,0));
rows.sort((a,b)=>a.path.localeCompare(b.path,'en'));
const groups=['الجذر','src','assets','tools','tests','docs','samples','references','tmp','.git'];
const groupNames={'الجذر':'ملفات الجذر',src:'مصادر النظام — JavaScript وCSS',assets:'الأصول والمكتبات والخطوط',tools:'أدوات البناء والفحص',tests:'الاختبارات',docs:'التوثيق',samples:'عينات الاستيراد',references:'المراجع الأصلية والبحث',tmp:'نواتج مؤقتة','.git':'ملفات Git الداخلية — ليست ملفات تشغيل'};
const table=list=>'<table><thead><tr><th>اسم الملف ومساره</th><th>وظيفته</th><th>ملخص محتواه</th><th>نوعه والحاجة إليه</th></tr></thead><tbody>'+list.map(r=>'<tr><td><bdi class="path">'+esc(r.path)+'</bdi><small>'+(r.path===target?'هذا التقرير المولّد':r.size===0?'فارغ — 0 بايت':Math.ceil(r.size/1024).toLocaleString('en')+' KB')+'</small></td><td>'+esc(r.role)+'</td><td>'+esc(r.content)+'</td><td>'+esc(r.status)+'</td></tr>').join('')+'</tbody></table>';
const count=rows.filter(r=>r.group!=='.git').length,git=rows.length-count;
const html='<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دليل ملفات ماسال</title><style>body{font:15px/1.8 Tahoma,Arial,sans-serif;background:#eff5f7;color:#15374b;margin:0}main{max-width:1500px;margin:auto;padding:24px}header,section,details{background:white;border:1px solid #cfdee5;border-radius:14px;padding:22px;margin-bottom:18px}h1,h2{margin:0 0 12px}a{color:#087f98}nav{display:flex;gap:14px;flex-wrap:wrap}.note{background:#e8f4f7;padding:12px;border-radius:8px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{padding:12px;text-align:right;vertical-align:top;border-bottom:1px solid #e1ebef;overflow-wrap:anywhere}th{background:#eaf3f6}th:first-child{width:25%}.path{direction:ltr;display:block;font:13px/1.7 Consolas,monospace}small{display:block;color:#667f8d}summary{font-weight:bold;cursor:pointer}section{overflow:auto}@media(max-width:700px){main{padding:8px}section{padding:8px}table{min-width:850px}}@media print{details{display:block}nav{display:none}section{break-before:page}th{background:#eee}}</style><main><header><h1>دليل ملفات ماسال</h1><p>تاريخ الفهرسة: 2026-09-30 — '+count+' ملفًا خارج Git و'+git+' ملفًا داخليًا في Git. الأرقام تشمل مولّد الدليل وهذا الدليل نفسه.</p><p class="note">هذا جرد وصفي، وليس فحصًا جديدًا لصحة كل وظيفة. «المحتوى» هنا ملخص لا نسخة من الكود. لم تُعرض رموز البطاقات أو أسرار الحسابات. بيانات التشغيل المحفوظة في المتصفح ليست ضمن هذه الملفات. ملفات العينات الثنائية وكائنات Git صُنّفت دون تفكيك كامل لمحتواها.</p><p>للبحث عن اسم ملف استخدم Ctrl + F. يبدأ الدليل بملفات التطبيق؛ القائمة الكاملة لملفات Git في القسم الأخير القابل للفتح.</p><nav>'+groups.map((g,i)=>'<a href="#g'+i+'">'+esc(groupNames[g])+' ('+rows.filter(r=>r.group===g).length+')</a>').join('')+'</nav></header>'+groups.map((g,i)=>{const list=rows.filter(r=>r.group===g);return g==='.git'?'<details id="g'+i+'"><summary>'+esc(groupNames[g])+' — '+list.length+' ملفًا</summary><p>هذا السجل مطلوب لإدارة الإصدارات محليًا، وليس ضمن نسخة العرض للشركة. أسماء كائناته ليست أسماء وحدات النظام.</p>'+table(list)+'</details>':'<section id="g'+i+'"><h2>'+esc(groupNames[g])+' — '+list.length+'</h2>'+table(list)+'</section>'}).join('')+'</main></html>';
fs.writeFileSync(path.join(root,target),html,'utf8');
console.log(JSON.stringify({report:target,applicationFiles:count,gitFiles:git,unknown:rows.filter(r=>r.role.startsWith('ملف مساعد')).map(r=>r.path)}));
