import sys
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
import av
from PIL import Image,ImageDraw
source='E:/فيديوات اجتماعات ماسال/الميتنك الثاني - ماسال 1.mp4'
c=av.open(source)
for sec in [110,430,610,920,1090,1370,1805,2020,2160,2550,2630]:
 c.seek(int(sec*av.time_base));f=next(c.decode(video=0));im=f.to_image();im.save(f'review/video/second-{sec}.jpg')
print('Frames saved')
