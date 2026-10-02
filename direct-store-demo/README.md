# دنارير

تطبيق Vue + PWA: https://our-qiq.com/direct-store-demo/
لوحة مستقلة: https://our-qiq.com/direct-store-demo/dashboard/
اسم المستخدم: admin. كلمة المرور حسب إعداد الخادم المطلوب من صاحب المشروع؛ اعتماد للنسخة التجريبية.

PHP 8.1+ يخزن JSON مع قفل المعاملات في /home/ourqiq/dananeer-demo-data خارج مجلد النشر. البيانات مشتركة بين الواجهتين. التطبيق يحدثها كل 8 ثوان عند ظهوره. الاستيراد TXT ببادئة DEMO-. الدفع والرموز وهمية، وهوية المشتري مرتبطة بالمتصفح. Qi غير مربوط رسميًا.

الوضع النهاري والليلي محفوظان لكل واجهة. الأرقام en-US، والتواريخ ar-IQ-u-nu-latn بتوقيت بغداد.

البناء: npm install ثم npm run build. انشر dist داخل public_html/direct-store-demo. إعداد base وPWA مقيدان بهذا المجلد. HTTPS صالح وخدمة PWA تم التحقق من تسجيلها. تعليمات النشر والتحقق في DEPLOYMENT.md.

للاختبار المحلي، اربط dist كمجلد direct-store-demo داخل جذر خادم PHP، واضبط DANANEER_DATA_DIR على بيانات اختبار منفصلة. شغل tests/api-check.mjs مع DEMO_TEST_URL لمسار API المحلي. الاختبارات تمنع التنفيذ خارج 127.0.0.1.

التشغيل الرسمي يتطلب مصادقة زبائن، وصلاحيات إدارة مناسبة، وقاعدة معاملات، وربط Qi الرسمي.

Version 7 adds media uploads, slides, support and Masal detail forms. Uploaded images stay in media/; JSON data stays outside the public folder. The support customer identity is browser-local for this demo. The direct store has no Masal agent/branch hierarchy. Receipt and card-field definitions are configuration metadata for the future official integration. Multi-file import currently supports demo TXT codes; Masal XLSX parsing and production card issuance are not connected.
