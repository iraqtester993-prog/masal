from pathlib import Path
import re,json,html
from html.parser import HTMLParser
p=Path('index.html');h=p.read_text(encoding='utf-8-sig')
h=h.replace('<script src="engine.js"></script>','<script src="engine.js"></script><script src="locales.js"></script>')
h=h.replace('<link rel="stylesheet" href="layout.css">','<link rel="stylesheet" href="layout.css"><link rel="stylesheet" href="polish.css">')
start=h.index('<template v-for="group in navGroups">');end=h.index('</template>',start)+len('</template>')
h=h[:start]+'''<section v-for="(group,gi) in navGroups" class="nav-section" :class="{'is-open':!collapsedGroups[group.title]}"><button class="navgroup" @click="toggleNavGroup(group.title)" :aria-expanded="!collapsedGroups[group.title]" :aria-controls="'nav-group-'+gi"><span>{{group.title}}</span><span class="nav-group-count">{{group.items.length}}</span><svg class="nav-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 8 4 4 4-4"/></svg></button><div class="nav-accordion" :id="'nav-group-'+gi" :inert="collapsedGroups[group.title]?true:null"><div class="navlinks"><button v-for="n in group.items" class="navitem" :class="{active:page===n.id}" :aria-current="page===n.id?'page':undefined" @click="go(n.id)"><span class="navicon">{{n.icon}}</span><span class="nav-label">{{n.label}}</span><span v-if="n.id==='exceptions'&&exceptions.length" class="count">{{exceptions.length}}</span></button></div></div></section>'''+h[end:]
h=h.replace('<div class="toptools">','''<div class="toptools"><select class="language-picker" v-model="lang" @change="setLanguage" aria-label="لغة الواجهة"><option value="ar">العربية</option><option value="en">English</option><option value="ckb">کوردی</option></select><button class="iconbtn quick-button" @click="openQuickActions" aria-label="إجراء سريع" title="إجراء سريع"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>''',1)
h=h.replace('v-model="currentUser" aria-label=', 'class="profile-picker" v-model="currentUser" aria-label=',1)
h=h.replace('@submit.prevent="transfer"','@submit.prevent="reviewTransfer"')
where=h.index('<form v-if="modal.kind===\'edit\'"')
h=h[:where]+'''<template v-if="modal.kind==='quick'"><p class="help">اختر الإجراء</p><div class="quick-grid"><button class="quick-tile" @click="quickAction('sell')"><span>▣</span><b>＋ عملية بيع</b></button><button v-if="['owner','supervisor','main'].includes(actor.role)" class="quick-tile" @click="quickAction('import')"><span>↥</span><b>＋ طلبية جديدة</b></button><button v-if="actor.role!=='pos'" class="quick-tile" @click="quickAction('agents',true)"><span>◇</span><b>إضافة وكيل</b></button><button v-if="actor.role!=='pos'" class="quick-tile" @click="quickAction('pos',true)"><span>▤</span><b>إضافة نقطة بيع</b></button><button class="quick-tile" @click="openTicket"><span>☏</span><b>＋ تذكرة جديدة</b></button><button v-if="actor.role==='owner'" class="quick-tile" @click="openDeposit"><span>＋</span><b>＋ إيداع</b></button></div></template>
<template v-else-if="modal.kind==='transferReview'"><div class="review-amount"><span>المبلغ • د.ع</span><strong>{{money(modal.transfer.amount)}}</strong></div><div class="rowline"><span>المرسل</span><b>{{accountName(modal.transfer.from)}}</b></div><div class="rowline"><span>المستلم</span><b>{{accountName(modal.transfer.to)}}</b></div><div class="formfoot"><button class="btn" @click="closeModal">رجوع</button><button class="btn primary" @click="confirmTransfer">تأكيد التحويل</button></div></template>
'''+h[where:]
h=h.replace('<form v-if="modal.kind===\'edit\'"','<form v-else-if="modal.kind===\'edit\'"',1)
# Translate visible text at render time, preserving business enum option values.
def option_value(m):
 tag,content=m.groups()
 if re.search(r'(?:\s|:)value=',tag):return m.group(0)
 expr=re.fullmatch(r'\s*{{(.*?)}}\s*',content,re.S)
 val=' :value="'+html.escape(expr.group(1),quote=True)+'"' if expr else ' value="'+html.escape(html.unescape(content.strip()),quote=True)+'"'
 return tag[:-1]+val+'>'+content+'</option>'
h=re.sub(r'(<option\b[^>]*>)([^<]*)</option>',option_value,h)
class Transform(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=False);self.out=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  text=self.get_starttag_text()
  if tag=='script':self.skip+=1
  if not self.skip:
   def attr(m):
    key,value=m.groups()
    if not re.search('[\u0600-\u06ff]',value):return m.group(0)
    return ':'+key+'="'+html.escape('t('+json.dumps(html.unescape(value),ensure_ascii=False)+')',quote=True)+'"'
   text=re.sub(r'(?<![:\w-])(placeholder|aria-label|title)="([^"]*)"',attr,text)
   text=re.sub(r':(aria-label|title)="([^"]+)"',lambda m:':'+m.group(1)+'="'+html.escape('t('+html.unescape(m.group(2))+')',quote=True)+'"' if not html.unescape(m.group(2)).startswith('t(') else m.group(0),text)
  self.out.append(text)
 def handle_endtag(self,tag):
  self.out.append('</'+tag+'>')
  if tag=='script':self.skip-=1
 def handle_startendtag(self,tag,attrs):self.out.append(self.get_starttag_text())
 def handle_data(self,data):
  if self.skip:self.out.append(data);return
  parts=re.split(r'({{.*?}})',data,flags=re.S)
  for s in parts:
   if s.startswith('{{'):self.out.append('{{t('+s[2:-2]+')}}')
   elif re.search('[\u0600-\u06ff]',s):self.out.append('{{t('+json.dumps(s,ensure_ascii=False)+')}}')
   else:self.out.append(s)
 def handle_entityref(self,n):self.out.append('&'+n+';')
 def handle_charref(self,n):self.out.append('&#'+n+';')
 def handle_comment(self,s):self.out.append('<!--'+s+'-->')
 def handle_decl(self,s):self.out.append('<!'+s+'>')
tr=Transform();tr.feed(h);p.write_text(''.join(tr.out),encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace("theme:document.documentElement.dataset.theme||'light',","theme:document.documentElement.dataset.theme||'light',lang:(()=>{try{return localStorage.getItem('masal-language')||'ar'}catch(e){return 'ar'}})(),",1)
s=s.replace('methods:{toggleTheme()', '''methods:{t(value){return MasalLocale.translate(value,this.lang)},setLanguage(){if(!['ar','en','ckb'].includes(this.lang))this.lang='ar';document.documentElement.lang=this.lang;document.documentElement.dir=this.lang==='en'?'ltr':'rtl';try{localStorage.setItem('masal-language',this.lang)}catch(e){}},toggleNavGroup(title){this.collapsedGroups[title]=!this.collapsedGroups[title]},openQuickActions(){this.modal={kind:'quick',title:'إجراء سريع'}},quickAction(page,edit=false){this.closeModal();this.go(page);if(edit&&this.page===page)this.openEdit()},reviewTransfer(){this.run(()=>{const x=Masal.clone(this.transferForm);const check=new Masal.Engine(Masal.clone(this.s),this.currentUser);check.transfer(x.from,x.to,x.amount);this.modal={kind:'transferReview',title:'مراجعة التحويل',transfer:x}})},confirmTransfer(){this.run(()=>{const x=this.modal.transfer;this.engine.transfer(x.from,x.to,x.amount);this.closeModal()},'تم التحويل وتسجيل قيدين متقابلين')},toggleTheme()''',1)
s=s.replace("new Date().toLocaleDateString('ar-IQ',", "new Date().toLocaleDateString(this.lang==='en'?'en-GB-u-nu-latn':this.lang==='ckb'?'ckb-IQ-u-nu-latn':'ar-IQ-u-nu-latn',")
s=s.replace("new Date(t).toLocaleString('ar-IQ',", "new Date(t).toLocaleString(this.lang==='en'?'en-GB-u-nu-latn':this.lang==='ckb'?'ckb-IQ-u-nu-latn':'ar-IQ-u-nu-latn',")
s=s.replace("d.toLocaleDateString('ar-IQ',", "d.toLocaleDateString(this.lang==='en'?'en-GB-u-nu-latn':this.lang==='ckb'?'ckb-IQ-u-nu-latn':'ar-IQ-u-nu-latn',")
s=s.replace('n.label.includes(this.navSearch)',"this.t(n.label).toLowerCase().includes(this.navSearch.toLowerCase())")
s=s.replace('},mounted(){this.loadBrand();','},mounted(){this.setLanguage();this.loadBrand();',1)
s=s.replace("if(e.key==='Escape')this.closeModal()","if(e.key==='Escape'){this.closeModal();this.menuOpen=false}")
p.write_text(s,encoding='utf-8')
p=Path('build.cjs');s=p.read_text(encoding='utf-8-sig').replace("fs.readFileSync('layout.css','utf8');","fs.readFileSync('layout.css','utf8')+'\\n'+fs.readFileSync('polish.css','utf8');")
s=s.replace(".replace('<link rel=\"stylesheet\" href=\"layout.css\">','');",".replace('<link rel=\"stylesheet\" href=\"layout.css\">','').replace('<link rel=\"stylesheet\" href=\"polish.css\">','');")
s=s.replace("'engine.js','app.js'","'engine.js','locales.js','app.js'")
p.write_text(s,encoding='utf-8')
