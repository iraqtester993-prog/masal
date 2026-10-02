import {base} from './shared.js'
// Art coordinates refer to the approved concept boards; UI remains live HTML.
const crops={
 G:{light:[145,105,305,154],dark:[145,699,305,143]},
 H:{light:[518,105,305,154],dark:[518,699,305,143]},
 J:{light:[889,105,315,154],dark:[889,699,315,143]},
 K:{light:[135,115,314,149],dark:[134,749,315,140]},
 L:{light:[488,115,315,152],dark:[488,748,315,139]},
 M:{light:[846,114,333,144],dark:[847,750,334,129]}
}
export function sceneStyle(id,theme){
 const glass=['G','H','J'].includes(id),[x,y,w,h]=(crops[id]||crops.H)[theme],bw=glass?1312:1227,bh=glass?1199:1282;
 return {'--scene-image':`url("${base}appearance-art/${glass?'glass':'prestige'}-board.png")`,'--scene-size':`${bw/w*100}%`,'--scene-x':`${x/(bw-w)*100}%`,'--scene-y':`${y/(bh-h)*100}%`,'--scene-ratio':`${w}/${h}`}
}
