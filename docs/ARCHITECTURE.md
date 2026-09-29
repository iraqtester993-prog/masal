# الانتقال إلى نظام إنتاج

## الواجهة الحالية

Vue 3 global build بلا bundler كي يعمل ملف HTML مباشرة. الواجهة وطبقة الأعمال منفصلتان في `app.js` و`engine.js`. التخزين الحالي localStorage أحادي المتصفح وغير موثوق للمحاسبة أو حماية الأسرار. `masal.html` نسخة مجمعة من الملفات المصدرية؛ ليس مصدرًا منفصلًا للتطوير.

## بنية مقترحة للخادم

- API مصادق عليه مع cookies آمنة، وسياسات RBAC + نطاق شجرة في كل استعلام.
- PostgreSQL للجداول المالية والمخزنية، وعمليات قاعدة بيانات ذرية للرصيد/الحجز/الإصدار.
- خزنة أسرار ومفاتيح KMS لتشفير حقول PIN وTokens؛ لا تخرج Tokens إلى Vue أو POS.
- طابور وظائف للمزودين والتصدير والإشعارات، وعمليات قابلة لإعادة المحاولة بمفاتيح idempotency.
- قناة أجهزة موثقة بشهادات، وتأكيد طباعة وتليمترية لكل موديل.
- سجل تدقيق منفصل لا تسمح صلاحيات التطبيق بتعديله أو حذفه.

## كيانات أساسية

`tenants / agents / agent_tree / users / roles / permissions / user_scopes`

`brands / suppliers / providers / provider_integrations / agent_credentials / products / product_fields / agent_product_access`

`orders / imports / import_rows / batches / cards / inventory_events / inventory_costs`

`wallets / ledger_entries / holds / transfers / deposits / settlements`

`price_lists / prices / price_changes / approvals / exchange_rates`

`pos_accounts / devices / device_certificates / sessions / risk_events`

`sales / sale_items / card_issues / print_jobs / print_attempts / reprint_approvals`

`claims / claim_items / resolutions / exports / export_downloads`

`support_tickets / messages / attachments / notifications / alerts / branding / receipt_templates / cms_content / audit_events / backups`

## مسار عملية بيع موثوق

1. التحقق من الجلسة وشهادة الجهاز والنطاق والحالة والحدود والسعر الفعال.
2. تثبيت مفتاح idempotency فريد للنقطة والطلب.
3. في معاملة واحدة: حجز الرصيد واختيار بطاقة FEFO/FIFO بقفل صف وعدم السماح بحجز متزامن.
4. إذا فشلت العملية قبل كشف PIN، يفك حجز الرصيد والبطاقة بالمعاملة نفسها.
5. عند الإصدار، تثبيت سعر وتكلفة ومعرف البطاقة، وتحويل الحجز إلى خصم، وتسجيل لحظة الكشف.
6. تسليم نفس الإصدار للجهاز وإرسال مهمة طباعة بمعرف ثابت.
7. عند فشل أو انقطاع الطباعة بعد الكشف، لا يعاد المخزون؛ تستعلم النقطة عن حالة العملية ثم تعيد طباعة الإصدار نفسه.
8. تأكيد نجاح أو فشل، وعدّ محاولات، وسبب إعادة، وموافقة حساسة عند تجاوز الحد.

## نقاط API المقترحة

| المجال | عمليات نموذجية |
|---|---|
| هوية | POST /auth/login, /auth/totp/verify, /auth/recovery, /sessions/revoke |
| هيكل | GET/POST /agents, /pos, /users؛ GET /agents/:id/tree |
| ملفات | POST /imports/validate؛ POST /imports/:id/commit؛ POST /batches/:id/reverse |
| بيع | POST /sales/reserve؛ POST /sales/:id/issue؛ POST /sales/:id/cancel-reservation |
| طباعة | POST /sales/:id/print-results؛ POST /sales/:id/reprint-requests |
| أموال | POST /wallets/transfers؛ POST /deposits؛ GET /wallets/:id/ledger |
| أسعار | POST /price-changes؛ POST /price-changes/:id/approve؛ POST /price-changes/:id/reverse |
| مطالبات | POST /claims؛ POST /claims/:id/resolve؛ POST /exports؛ GET /exports/:id/download |
| مزود | POST /agent-credentials؛ POST /agent-credentials/:id/rotate؛ POST /integrations/:id/test؛ POST /webhooks/:provider |

كل عملية كتابة مالية/مخزنية تحتاج transaction ونسخة سجل/قفل تفاؤلي ومفتاح عدم تكرار، وسجل تدقيق بلا PIN أو Token في نصه.

## المعلومات المطلوبة قبل الربط

عينات أصلية لكل تنسيق بطاقات، وثائق وبيئة اختبار API لكل مزود، أجهزة POS أو SDK وبروتوكول تأكيد الطباعة، سياسة الائتمان والعمولات والضرائب وتعويض المطالبات، صلاحيات الاعتماد الحساسة، مدة الاحتفاظ بالسجلات، وسياسة اللغات والموقع الجغرافي.
