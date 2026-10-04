# دليل ترتيب الملفات

## المصدر النشط داخل src

ملفات JavaScript داخل src/js/ والتنسيقات داخل src/css/. تم تعديل index.html وtools/build.cjs ومسارات الخطوط والاختبارات. ليس كل ملف JavaScript منفصلًا تطبيقًا مستقلًا؛ ملفات كثيرة توسّع نفس المحرك ويهم ترتيب تحميلها. تبقى صفحات index.html وmasal.html في الجذر لتثبيت عناوين التشغيل.

| القسم | أمثلة للبحث |
|---|---|
| المدخل والبناء | index.html، masal.html، tools/build.cjs، src/js/app.js |
| الهوية والتخطيط | reference-identity.css، styles.css، theme.css، layout.css |
| الحسابات والصلاحيات | access.js، staff-model.js، network-accounts.js، password-admin.js |
| المحافظ والتمويل | simple-wallets.js، funding-rules.js، wallet-filters.js |
| الفئات والطلبيات والمخزون | categories-ui.js، order-parser.js، multi-orders.js، inventory-management.js |
| البيع والطباعة | engine.js، workflow-engine.js، print-policies.js، card-layout.js |
| التقارير | reports.js، report-groups.js، audit-details.js |
| الدعم والإشعارات | support-chat.js، support-routing.js، activity-notifications.js |
| الموقع والخريطة | company-site.js، user-map.js، regions.js |
| اللغات | locales.js، ui-localization.js، ملفات *-locales.js |

## المجلدات المنظمة

- tests/: اختبارات الجذر السابقة. setup.cjs يثبت مسار العمل على الجذر. عُدلت استدعاءات وحدات المصدر والمراجع المنقولة.
- docs/: أدلة الجذر السابقة. README-legacy.md توثيق تاريخي قد يحتوي أسماء ومسارات قديمة؛ تعليمات التشغيل الحالية في README.md الجديد.
- samples/orders/: ملفات sample-orders السابقة.
- samples/formats/: ملفات outputs السابقة بصيغ متعددة.
- samples/: عينات البطاقات الصحيحة والخاطئة.
- references/: مرجع الفئات New Text Dسocument.txt وملفات المصدر الأصلية ومتطلبات النص المستخرج؛ لا تحذفها باعتبارها مؤقتات.
- references/research/: ملاحظات ومراجع نصية محفوظة قبل إخراج الأرشيف.
- samples/handoff/: عينات مستخدمة في اختبارات التسليم؛ فُصلت عن نسخة التسليم القديمة.
- tmp/: نتائج اختبارات قابلة للتجديد، مستبعدة من Git، ويمكن إخراجها بعد الفحص.

أُخرج archive/ بالكامل من المشروع إلى مجلد removed-from-project داخل النسخة الاحتياطية الخارجية. يشمل صور المعاينة والنسخ القديمة وأدوات تحليل الفيديو وسكربتات التعديل القديمة. يمكن استرجاعه عند الحاجة، وليس مطلوبًا للتشغيل. tools/build.cjs وassets/ مطلوبان لإعادة البناء.

## تسليم الشركة

للتجربة المحلية: masal.html مع تعليمات الاستخدام وتراخيص المكتبات والخطوط. لتسليم المصدر: صفحات الجذر وsrc/ وassets/ وdocs/ وtests/ وtools/ وعينات تجريبية مختارة. لا تسلّم .git أو references/ أو tmp/ ضمن نسخة العرض العامة.

رفع الكود إلى GitHub Pages لا يحوله إلى Backend. يجب تنفيذ المصادقة والصلاحيات والمعاملات والتخزين المشترك وربط OTP على الخادم في المرحلة التالية.
