from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf-8')
s=s.replace("{{tr(visiblePOS.filter(p=>p.onli)}}&&p.active;).length}}","{{tr(visiblePOS.filter(p=>p.online && p.active).length)}}")
s=s.replace("{{tr(s.cards.filter(c=>c.batch===b.)}}&&c.status;==='Available').length}}","{{tr(s.cards.filter(c=>c.batch===b.id && c.status==='Available').length)}}")
s=s.replace('{{tr(visibleSales.filter(t=>Date.now()-Date.parse(t.tim)}}<{{tr("7*86400000).length}} عملية")}}',"{{tr(visibleSales.filter(t=>Date.now()-Date.parse(t.time) < 7*86400000).length)}} {{tr('عملية')}}")
p.write_text(s,encoding='utf-8')
