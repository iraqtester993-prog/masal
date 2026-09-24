import json,zipfile,xml.etree.ElementTree as E
from pathlib import Path
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile('tmp/report-export-check.xlsx') as z:
 assert z.testzip() is None
 for f in z.namelist(): E.fromstring(z.read(f))
 sheets=E.fromstring(z.read('xl/workbook.xml')).find('s:sheets',ns)
 expected=json.loads(Path('tmp/report-export-expected.json').read_text())
 assert len(sheets)==len(expected)+1
 assert all(len(s.attrib['name'])<=31 for s in sheets)
 assert len({s.attrib['name'].lower() for s in sheets})==len(sheets)
 for i,section in enumerate(expected,2):
  sheet=E.fromstring(z.read(f'xl/worksheets/sheet{i}.xml'))
  assert len(sheet.find('s:sheetData',ns))==section['rows']+3
  assert len(sheet.find('s:sheetData',ns)[2])==section['headers']
  assert not sheet.findall('.//s:f',ns)
print('PASS valid XLSX package, XML, unique sheet names, complete rows and headers, no executable formulas')
