import json,zipfile,xml.etree.ElementTree as E
from pathlib import Path
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def cells(row):
 return [float(c.find('s:v',ns).text) if c.find('s:v',ns) is not None else ''.join(c.itertext()) for c in row]
for mode in ['false','true']:
 snap=json.loads(Path('tmp/report-parity-'+mode+'.json').read_text(encoding='utf8'))
 with zipfile.ZipFile('tmp/report-parity-'+mode+'.xlsx') as z:
  for file in z.namelist():E.fromstring(z.read(file))
  for i,section in enumerate(snap['sections'],2):
   root=E.fromstring(z.read(f'xl/worksheets/sheet{i}.xml'));rows=list(root.find('s:sheetData',ns))
   assert cells(rows[0])==[section['title']+' · '+str(len(section['rows']))]
   assert cells(rows[1])==[section['note']]
   assert cells(rows[2])==section['headers']
   if section['values']:assert [cells(r) for r in rows[3:]]==section['values']
   else: assert cells(rows[3])==[snap['empty']]
print('PASS every Excel section title, note, column, value and empty message matches PDF source for both filter cases')
