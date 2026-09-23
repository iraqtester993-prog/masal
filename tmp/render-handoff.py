import pymupdf as fitz
from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
p=Path('tmp/pdfs/handoff');p.mkdir(parents=True,exist_ok=True)
doc=fitz.open('output/pdf/masal-handoff-guide.pdf')
for i,page in enumerate(doc):
 pix=page.get_pixmap(matrix=fitz.Matrix(1.4,1.4));pix.save(str(p/f'page-{i+1:02}.png'))
for start in range(0,len(doc),6):
 sheet=Image.new('RGB',(1260,1220),'#d9e4eb')
 for j in range(start,min(start+6,len(doc))):
  im=Image.open(p/f'page-{j+1:02}.png');im.thumbnail((405,580));x=10+(j-start)%3*420;y=10+(j-start)//3*610;sheet.paste(im,(x,y));ImageDraw.Draw(sheet).text((x+8,y+584),str(j+1),fill='black')
 sheet.save(p/f'sheet-{start//6+1}.png')
print('Rendered',len(doc),'pages')
