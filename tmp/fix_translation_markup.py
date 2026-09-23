from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf-8-sig')
s=re.sub(r'<option v-for="u in s.users.filter.*?</option>','<option v-for="u in s.users.filter(u=>u.active)" :value="u.id">{{t(u.name)}}</option>',s)
s=re.sub(r'<option v-for="a in visibleAgents.filter.*?</option>', '<option v-for="a in visibleAgents.filter(a=>a.type===\'رئيسي\')" :value="a.id">{{t(a.name)}}</option>',s)
s=s.replace('{{t(','{{tr(').replace('="t(', '="tr(')
s=re.sub(r'<title>.*?</title>','<title>ماسال كاردز | Masal Cards</title>',s)
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8-sig');s=s.replace('methods:{t(value)','methods:{tr(value){return this.t(value)},t(value)',1);p.write_text(s,encoding='utf-8')
