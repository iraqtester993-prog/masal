# نشر دنارير — تحديث الوضعين

التطبيق: https://our-qiq.com/direct-store-demo/
الإدارة: https://our-qiq.com/direct-store-demo/dashboard/
الدخول: admin، بكلمة المرور المطلوبة من صاحب المشروع.

النشر داخل /home/ourqiq/public_html/direct-store-demo. البيانات مستمرة في /home/ourqiq/dananeer-demo-data خارج الجذر العام. لم يتغير النظام الأصلي. رابط HTTP القديم يحول إلى رابط HTTPS الجديد.

أضيف اختيار نهاري/ليلي مستقل لكل واجهة محفوظ في المتصفح، وحذفت الشروحات الداخلية. الأرقام إنجليزية. المصادقة تتطلب اسم المستخدم وكلمة المرور وتُرفض بيانات العرض القديمة.

نجحت اختبارات API المحلية: الدخول الصحيح والخاطئ، صلاحيات الإدارة، الاستيراد، منع تكرار الرموز، تغير الأسعار، عدم تجاوز المخزون، تكرار الطلب وعزل الزبائن. نجح الدخول على HTTPS ومراجعة الوضعين وحفظ الاختيار. خدمة PWA سجلت بنجاح بنطاق https://our-qiq.com/direct-store-demo/، وملف manifest يبدأ داخل نفس المجلد. لم يتم تثبيت التطبيق على جهاز المستخدم أثناء الاختبار؛ ذلك يتم من متصفح الهاتف.

شهادة demo.our-qiq.com لا تزال منتهية؛ استُخدم النطاق الأصلي ذو HTTPS الصالح حسب طلب المستخدم. الدفع يظل تجريبيًا ولا يوجد ربط Qi رسمي.

تحديث التصميم: طبقة واجهات مستوحاة من أبل بألوان رمادية وأزرق، خط النظام، قوائم شفافة وبطاقات ناعمة. روجع الهاتف والوضعان والداشبورد ونُشرت النسخة dananeer-apple-recharge-v4.zip. أيقونة الرصيد icon-recharge-192.png وicon-recharge-512.png موجودة في الواجهتين وmanifest. الأصل والوصف في design/. نجح البناء ولا تظهر أخطاء في console للواجهة المنشورة.

UI update v6: deployed dananeer-cards-v6.zip to the isolated direct-store-demo folder. Header search expands on click; hero spacing reduced; product and company cards redesigned; explicit purchase buttons verified on the live site. Build passed.

Experience v7: isolated demo update. Upload dananeer-experience-v7.zip built from release-v7 (fresh output, 20 PWA precache entries). Adds validated admin-only PNG/JPG/WebP uploads (2 MB, 4096 px), product images, company logos, up to 10 image/title slides, customer-owned support conversations with admin replies and closure. Adds Masal company/category detail fields, per-customer daily limits and city scope, multi-file atomic demo imports grouped by order, detailed dialogs. No existing Masal data copied. tests/api-check.mjs, tests/features-check.mjs, tests/templates-check.mjs passed. Uploads live in direct-store-demo/media and persist across archive extraction. Qi payments remain simulated. Import files remain demo TXT, DEMO- codes only.

Published v7 successfully via cPanel extraction. Live checks: image upload preview succeeds, support message appears in dashboard and admin reply appears for the same customer, both color themes verified, no browser errors. Live demo support thread retained as a labeled test. Category image upload tested without changing the existing product. No data from Masal was modified.

Layout v8: compact 180 px mobile slider; each ad has independent save, description, optional validated HTTP(S) link and visibility. Company cards show large logo and name. Product rails show up to 10 image/name/price/buy cards, with full filtered catalog. Dashboard controls up to 10 ordered featured/all/company/manual home sections. Mobile pill navigation keeps the four existing Arabic labels and blue color, raised active icon. Local API, features, layout and runtime template checks passed; fresh release-v8 has 20 precache entries.

Published v8 plus API compatibility patch through cPanel. Existing ads default to active and gain empty description/link fields. Existing live settings, logos, images, stock and orders preserved. Store and dashboard visibly verified on HTTPS; mobile light/dark screenshots preview-nav-v8-light.jpg and preview-nav-v8-dark.jpg.

Model 3 v9: user selected original concept 3, superseding model 4 and animated preview proposals. Customer UI has graphite dark surfaces, rounded company tiles with logo/name, vertical recharge cards with denomination and company branding (uploaded category artwork preserved), blue buy buttons and floating mobile nav with subtle selected fill and small dot. Store-only styling; no dashboard or data changes. Runtime templates and production build passed. Package dananeer-model-three-v9.zip.

Published v9 via cPanel to isolated direct-store-demo. Verified extraction and live HTML/CSS updates, mobile company tiles, voucher fallback and category images, nav selection between home and catalog, both themes, no console errors. Screenshot proof: preview-model-three-v9-dark.jpg and preview-model-three-v9-light.jpg. Live stock/orders/settings unchanged.

Six appearances v10: published dananeer-six-appearances-v10.zip from clean release-v10-final. Dashboard settings controls G/H/J/K/L/M with separate save and preview. Each has light/dark tokens; J/M horizontal cards, G/H/K/L vertical cards and differentiated company/nav styles. Admin-only appearance-save validates enum and preserves other settings. Store refresh propagates saved style every 8 seconds. Local appearance API isolation/validation checks, Vue runtime template checks, PHP lint and build passed. Live dashboard saved J then G; public store reflected both without reload, and light/dark switch verified. Live inventory remained 133 cards, 9 categories, 6 companies, 2 orders. Screenshot preview-six-appearances-v10.jpg. Default G active, all six selectable.

Reference correction v11: native HTML card/company/nav proportions rebuilt from approved G/H/J and K/L/M boards. Shared raster concept boards supply only decorative hero scenes through CSS crop coordinates; live card text, prices, buy actions, search, navigation and dashboard remain actual interactive controls. Added optional referenceHero boolean admin setting; saved user ads continue as separate slides. Uploaded company/category assets preserved. Six skins/two modes checked locally for page overflow; checkout and support navigation verified. PHP lint, runtime template checks, protected appearance/catalog tests and clean production build passed. Package dananeer-reference-v11.zip, release-v11-publish.
Published v11 via cPanel extraction. Live application loaded assets/store-B8pUmmTF.js and assets/store-Bie3GPVY.css; G/H/J/K/L/M art scenes and layout verified at 375 px with no document overflow. Live checkout opens with correct amount, no purchase submitted. Dashboard shows referenceHero control and all six appearance choices. Saved appearance was being changed by the user during verification; no saved selection overwritten. Actual H preview screenshots: preview-live-H-light-v11.jpg and preview-live-H-dark-v11.jpg. Existing uploaded logos/category images retained, therefore product artwork differs from concept examples. No browser error logs observed.
