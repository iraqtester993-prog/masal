import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
import av
videos=json.loads(Path('review/video/inventory.json').read_text(encoding='utf-8'))
for video_id,second in [(3,605),(3,980),(4,350),(1,500),(2,1200),(6,900)]:
    item=next(x for x in videos if x['id']==video_id)
    with av.open(str(Path('E:/فيديوات اجتماعات ماسال')/item['file'])) as c:
        st=c.streams.video[0];c.seek(int(second/float(st.time_base)),stream=st)
        for frame in c.decode(st):
            if frame.time>=second:
                frame.to_image().save(f'review/video/evidence-{video_id}-{second}.png');break
print('Extracted six full resolution evidence frames')
