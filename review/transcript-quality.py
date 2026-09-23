from pathlib import Path
from collections import Counter
import json,re
b=Path(__file__).resolve().parent/'video'
result=[]
for v in json.loads((b/'inventory.json').read_text(encoding='utf-8')):
    p=b/f'video-{v["id"]}-transcript.jsonl'
    if not p.exists():continue
    segments=[json.loads(x) for x in p.read_text(encoding='utf-8').splitlines()]
    flags=[]
    for s in segments:
        words=re.findall(r'\w+',s['text'])
        grams=Counter(tuple(words[i:i+3]) for i in range(max(0,len(words)-2)))
        reason=[]
        if max(grams.values(),default=0)>=6:reason.append('تكرار آلي مشتبه')
        if len(words)<8 and s['end']-s['start']>20:reason.append('نص قصير بالنسبة لمدة المقطع؛ يحتاج تدقيق')
        if reason:flags.append({'start':s['start'],'end':s['end'],'reason':reason})
    result.append({'id':v['id'],'file':v['file'],'duration':v['seconds'],'processing_complete':p.with_suffix('.done').exists(),'segments':len(segments),'last_transcribed_end':segments[-1]['end'] if segments else 0,'suspect_segments':flags,'note':'المؤشر آلي لا يقيس دقة التفريغ ولا يثبت فهم كل الكلام. المقاطع غير المعلّمة قد تحتوي أخطاء أيضًا.'})
(b/'video-review-coverage.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{k:v[k] for k in ['id','processing_complete','segments','last_transcribed_end']}|{'suspect_count':len(v['suspect_segments'])} for v in result]))
