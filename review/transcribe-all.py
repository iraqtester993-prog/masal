import sys,os,time,json
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING']='1'
os.environ['HF_HUB_DISABLE_XET']='1'
from faster_whisper import WhisperModel,BatchedInferencePipeline
model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=8,download_root='review/models')
pipe=BatchedInferencePipeline(model=model)
files=json.loads(Path('review/video/inventory.json').read_text(encoding='utf-8'))
for i in [3,4,5,6,1,2]:
    v=next(v for v in files if v['id']==i)
    out=Path(f'review/video/video-{i}-transcript.jsonl')
    if out.with_suffix('.done').exists():continue
    started=time.time();print(f'START video {i}',flush=True)
    segments,info=pipe.transcribe(str(Path('E:/فيديوات اجتماعات ماسال')/v['file']),language='ar',beam_size=1,batch_size=8,vad_filter=True)
    count=0
    with out.open('w',encoding='utf-8') as f:
        for s in segments:
            f.write(json.dumps({'start':s.start,'end':s.end,'text':s.text},ensure_ascii=False)+'\n');f.flush();count+=1
            if count%40==0:print(f'video {i}: {s.end:.0f}/{v["seconds"]:.0f}s audio, {time.time()-started:.0f}s elapsed',flush=True)
    out.with_suffix('.done').write_text(str(time.time()-started))
    print(f'DONE video {i}: {time.time()-started:.0f}s elapsed',flush=True)
