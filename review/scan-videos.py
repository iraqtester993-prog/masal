import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
import av
from PIL import Image,ImageDraw
out=Path('review/video');out.mkdir(exist_ok=True)
rows=[]
for i,p in enumerate(Path('E:/فيديوات اجتماعات ماسال').glob('*.mp4'),1):
 c=av.open(str(p));duration=c.duration/av.time_base;v=c.streams.video[0];row={'id':i,'file':p.name,'seconds':round(duration,1),'minutes':round(duration/60,1),'streams':[s.type for s in c.streams]};rows.append(row)
 sheet=Image.new('RGB',(1440,870),'#ffffff');d=ImageDraw.Draw(sheet)
 for j,fraction in enumerate([.03,.2,.4,.6,.8,.96]):
  sec=duration*fraction;c.seek(int(sec*av.time_base));frame=next(c.decode(video=0));img=frame.to_image();img.thumbnail((710,250));x=(j%2)*720;y=(j//2)*290;sheet.paste(img,(x,y+28));d.text((x+8,y+6),f'VIDEO {i} / {int(sec//60):02d}:{int(sec%60):02d}',fill='black')
 sheet.save(out/f'video-{i}-overview.jpg');c.close()
(out/'inventory.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(rows,ensure_ascii=False,indent=2))
