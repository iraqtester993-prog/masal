from pathlib import Path
p=Path('tmp/package-handoff.py')
s=p.read_text(encoding='utf-8-sig').replace('6. اقرأ دليل masal-handoff-guide.pdf وخطوات تهيئة المحافظات والشركات والفئات والوكلاء قبل استيراد البطاقات.','6. شبكة عرض جاهزة تضاف مرة واحدة مع 1000 بطاقة. اقرأ حسابات العرض.txt للدخول والتبعية والأرصدة.\n   الدليل العام أُعد قبل إضافة الشبكة؛ استخدم ملف حسابات العرض لأحدث بيانات البداية.')
p.write_text(s,encoding='utf-8')
