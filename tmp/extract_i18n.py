import re,json
from pathlib import Path
h=Path('index.html').read_text(encoding='utf-8-sig')
h=re.sub(r'<script.*?</script>','',h,flags=re.S)
h=re.sub(r'{{.*?}}','',h,flags=re.S)
a=[x.strip() for x in re.findall(r'>([^<>]+)<',h) if re.search('[\u0600-\u06ff]',x)]
a+=re.findall(r'(?:placeholder|aria-label|title)="([^"]*[\u0600-\u06ff][^"]*)"',h)
for file in ['app.js','engine.js']:
 s=Path(file).read_text(encoding='utf-8-sig')
 a +=[x for x in re.findall(r"'([^'\n]*)'",s) if re.search('[\u0600-\u06ff]',x) and len(x)<250 and '<' not in x]
Path('tmp/i18n-strings.json').write_text(json.dumps(sorted(set(a)),ensure_ascii=False,indent=2),encoding='utf-8')
