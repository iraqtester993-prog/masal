from pathlib import Path
from openpyxl import Workbook
from datetime import datetime
p=Path(__file__).parent/'import-test.xlsx'
w=Workbook();s=w.active;s.title='Cards';s.append(['pin','serial','expiry']);s.append(['00001234567890123456','SERIAL-XLSX',datetime(2030,12,31)]);s['C2'].number_format='yyyy-mm-dd';w.save(p)
print('Created XLSX fixture')
