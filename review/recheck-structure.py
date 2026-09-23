import sys,json,time,os
from pathlib import Path
sys.path.insert(0,str(Path('review/media-runtime').resolve()))
import av
from faster_whisper import WhisperModel,BatchedInferencePipeline
source=Path('E:/فيديوات اجتماعات ماسال/1- ماسال - فيديو ميتنك شرح هيكلية النظام.mp4')
c=av.open(str(source));print('Duration seconds:',c.duration/av.time_base,flush=True);c.close()
model=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=8,download_root='review/models',local_files_only=True)
pipe=BatchedInferencePipeline(model=model)
start=time.time()
segments,info=pipe.transcribe(str(source),language='ar',beam_size=3,batch_size=8,vad_filter=True,repetition_penalty=1.15,no_repeat_ngram_size=5)
with Path('review/video/structure-2026-09-23.jsonl').open('w',encoding='utf8') as out:
 for i,s in enumerate(segments):
  out.write(json.dumps({'start':s.start,'end':s.end,'text':s.text,'avg_logprob':s.avg_logprob},ensure_ascii=False)+'\n');out.flush()
  if i%30==0: print('Processed audio',round(s.end),'seconds; elapsed',round(time.time()-start),flush=True)
print('DONE',round(time.time()-start),flush=True)
