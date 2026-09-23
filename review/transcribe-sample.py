import sys,os,time,json
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING']='1';os.environ['HF_HUB_DISABLE_XET']='1'
from faster_whisper import WhisperModel
start=time.time();print('Loading small Arabic-capable model',flush=True)
m=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=6,download_root='review/models')
print('Model loaded',time.time()-start,flush=True)
files=json.loads(Path('review/video/inventory.json').read_text(encoding='utf-8'))
p=Path('E:/فيديوات اجتماعات ماسال')/files[2]['file']
segments,info=m.transcribe(str(p),language='ar',beam_size=3,vad_filter=True,clip_timestamps='0,90')
rows=[{'start':s.start,'end':s.end,'text':s.text} for s in segments]
Path('review/video/asr-sample.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8');print('Sample complete seconds',time.time()-start,flush=True)
