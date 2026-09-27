import sys,json,re,zipfile,collections,datetime
from pathlib import Path
import xml.etree.ElementTree as ET
sys.stdout.reconfigure(encoding='utf-8')
base=Path('C:/Users/PRO/Desktop')
mask=lambda s:re.sub(r'\d{7,}',lambda m:'[digits:'+str(len(m[0]))+']',str(s))
file=base/'eVouchersDownload_2022-01-04 12 06.txt'
lines=[l.strip() for l in file.read_text(encoding='utf-8-sig').splitlines() if l.strip()]
rows=[l.split(',') for l in lines[1:]]
print(json.dumps({'file':file.name,'header':mask(lines[0]),'records':len(rows),'widths':dict(collections.Counter(len(r) for r in rows)),'serial_lengths':dict(collections.Counter(len(r[0]) for r in rows)),'pin_lengths':dict(collections.Counter(len(r[1]) for r in rows)),'dates':dict(collections.Counter(r[2] for r in rows)),'duplicate_serials':len(rows)-len(set(r[0] for r in rows)),'duplicate_pins':len(rows)-len(set(r[1] for r in rows)),'pins_starting_zero':sum(r[1].startswith('0') for r in rows)},ensure_ascii=False))
file=base/'ك5.xlsx'
print('Workbook magic:',file.read_bytes()[:8].hex())
if zipfile.is_zipfile(file):
 ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
 with zipfile.ZipFile(file) as z:
  strings=[]
  if 'xl/sharedStrings.xml' in z.namelist():
   strings=[''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
  print('Workbook:',ET.tostring(ET.fromstring(z.read('xl/workbook.xml')),encoding='unicode')[:4000])
  for name in z.namelist():
   if re.fullmatch(r'xl/worksheets/sheet\d+.xml',name):
    rt=ET.fromstring(z.read(name));cells=[]
    for c in rt.findall('.//s:sheetData/s:row/s:c',ns):
     t=c.get('t');v=c.find('s:v',ns);value=v.text if v is not None else ''
     if t=='s':value=strings[int(value)]
     elif t=='inlineStr':value=''.join(c.find('s:is',ns).itertext())
     if value:cells.append((c.get('r'),t,value))
    print(json.dumps({'part':name,'dimension':rt.find('s:dimension',ns).get('ref') if rt.find('s:dimension',ns) is not None else None,'populated_cells':len(cells),'types':dict(collections.Counter(c[1] or 'numeric' for c in cells)),'first_cells':[(r,t,mask(v)) for r,t,v in cells[:2]],'last_cells':[(r,t,mask(v)) for r,t,v in cells[-1:]],'formulas':len(rt.findall('.//s:f',ns))},ensure_ascii=False))
    parsed=[];bad=[]
    for address,typ,value in cells:
     match=re.search(r'\b(E\w+)\s*:\s*HRN\s+SN\s+(\d+)\s+(\d+)\s+.*?(\d{2}-\d{2}-\d{4}).*?:\s*(\d+)\.',value)
     if not match:bad.append(address)
     else:parsed.append(match.groups())
    if cells:
     print(json.dumps({'matched':len(parsed),'unmatched_cells':bad[:10],'categories':dict(collections.Counter(x[0] for x in parsed)),'pin_lengths':dict(collections.Counter(len(x[1]) for x in parsed)),'serial_lengths':dict(collections.Counter(len(x[2]) for x in parsed)),'dates':dict(collections.Counter(x[3] for x in parsed)),'duplicate_pins':len(parsed)-len(set(x[1] for x in parsed)),'duplicate_serials':len(parsed)-len(set(x[2] for x in parsed)),'pin_leading_zeros':sum(x[1].startswith('0') for x in parsed),'unique_transaction_references':len(set(x[4] for x in parsed))},ensure_ascii=False))
else:
 print('Not a ZIP xlsx workbook; inspect actual binary format before parsing.')
code_file=base/'New Text Dسocument.txt'
groups=[g.strip().splitlines() for g in re.split(r'-{3,}',code_file.read_text(encoding='utf-8-sig')) if g.strip()]
print(json.dumps({'code_groups':len(groups),'category_codes':sum(len(g)-1 for g in groups),'groups':groups},ensure_ascii=False))
