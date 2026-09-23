from pathlib import Path
import re
p=Path('app.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace("t(value){return MasalLocale.translate(value,this.lang)}", "t(value){if(typeof value!=='string')return MasalLocale.translate(value,this.lang);const saved=[];let source=value;const names=[...this.s.agents,...this.s.pos,...this.s.products,...this.s.providers].map(r=>r.name).filter(Boolean).sort((a,b)=>b.length-a.length);for(const name of names){if(source.includes(name)){const key='__RECORD_'+saved.length+'__';saved.push([key,name]);source=source.split(name).join(key)}}source=MasalLocale.translate(source,this.lang);for(const [key,name]of saved)source=source.split(key).join(MasalLocale.latin(name));return source}")
s=re.sub(r"todayLabel\(\)\{return new Date\(\)\.toLocaleDateString\(.*?\)\}", "todayLabel(){return MasalLocale.date(new Date(),this.lang,'long')}",s,count=1)
s=re.sub(r"formatTime\(t\)\{return new Date\(t\)\.toLocaleString\(.*?\)\}", "formatTime(t){return MasalLocale.date(t,this.lang,'short')}",s,count=1)
s=re.sub(r"d\.toLocaleDateString\(this.lang==='en'.*?\{weekday:'short'\}\)", "MasalLocale.date(d,this.lang,'weekday')",s,count=1)
s=s.replace("if(e.key==='Escape'){this.closeModal();this.menuOpen=false}","if(e.key==='Escape'){this.closeModal();this.menuOpen=false}if(e.key==='Tab'&&this.modal){const nodes=[...document.querySelectorAll('.modal button,.modal input,.modal select,.modal textarea,.modal a')].filter(x=>!x.disabled&&x.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}")
s=s.replace("watch:{s:","watch:{modal(value){if(value){this._lastFocus=document.activeElement;this.$nextTick(()=>document.querySelector('.modal input:not([type=file]),.modal select,.modal textarea,.modal button')?.focus())}else this.$nextTick(()=>this._lastFocus?.focus?.())},s:",1)
p.write_text(s,encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8-sig');s=s.replace('<div class="shell">','<div class="shell" :inert="modal?true:null">',1)
s=s.replace('<span>▣</span>','<span aria-hidden="true">▣</span>').replace('<span>↥</span>','<span aria-hidden="true">↥</span>').replace('<span>◇</span>','<span aria-hidden="true">◇</span>').replace('<span>▤</span>','<span aria-hidden="true">▤</span>').replace('<span>☏</span>','<span aria-hidden="true">☏</span>').replace('<span>＋</span>','<span aria-hidden="true">＋</span>')
p.write_text(s,encoding='utf-8')
