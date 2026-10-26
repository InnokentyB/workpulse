import type {PoseLandmark} from './neck-motion-tracker';
export type LanternArmsState={count:number;phase:'calibrating'|'hold'|'lower'|'complete';gesture:'sideways'|'overhead';lastTimestamp:number;calibrationFrames:number;anchorX:number;anchorY:number;anchorWidth:number;heldAt:number|null;holdFrames:number;lowerFrames:number};
export function initialLanternArms(count=0):LanternArmsState{const safe=Number.isInteger(count)?Math.max(0,Math.min(4,count)):0;return {count:safe,phase:safe===4?'complete':'calibrating',gesture:safe%2?'overhead':'sideways',lastTimestamp:-1,calibrationFrames:0,anchorX:0,anchorY:0,anchorWidth:0,heldAt:null,holdFrames:0,lowerFrames:0};}
/** Seated upper-body sequence. Never requires or invents lower-body landmarks. */
export function updateLanternArms(s:LanternArmsState,p:PoseLandmark[],t:number):LanternArmsState{
 if(!Number.isFinite(t)||t<=s.lastTimestamp)return s;
 if(s.phase==='complete')return {...s,lastTimestamp:t};
 const reset=()=>({...initialLanternArms(s.count),lastTimestamp:t});
 if(s.lastTimestamp>=0&&t-s.lastTimestamp>750)return reset();
 if([0,11,12,13,14,15,16].some(i=>!p[i]||!Number.isFinite(p[i].x)||!Number.isFinite(p[i].y)||!Number.isFinite(p[i].visibility)||(p[i].visibility??0)<.65||p[i].x<.015||p[i].x>.985||p[i].y<.015||p[i].y>.985))return reset();
 const w=Math.abs(p[12].x-p[11].x),x=(p[11].x+p[12].x)/2,y=(p[11].y+p[12].y)/2;
 if(w<.08)return reset();
 const neutral=p[15].y>y+.65*w&&p[16].y>y+.65*w&&p[13].y>y+.2*w&&p[14].y>y+.2*w;
 if(s.phase==='calibrating'){
  if(!neutral)return reset();
  const stable=s.calibrationFrames>0&&Math.abs(x-s.anchorX)<w*.08&&Math.abs(y-s.anchorY)<w*.08&&Math.abs(w-s.anchorWidth)<w*.1;
  const frames=stable?s.calibrationFrames+1:1;
  return {...s,lastTimestamp:t,calibrationFrames:frames,anchorX:stable?s.anchorX:x,anchorY:stable?s.anchorY:y,anchorWidth:stable?s.anchorWidth:w,phase:frames>=8?'hold':'calibrating'};
 }
 if(Math.abs(w-s.anchorWidth)>s.anchorWidth*.3)return reset();
 const left=p[11].x<p[12].x?11:12,right=left===11?12:11,le=left+2,re=right+2,lw=left+4,rw=right+4;
 const sideways=[le,re,lw,rw].every(i=>Math.abs(p[i].y-y)<=.35*w)&&p[lw].x<=p[left].x-.65*w&&p[rw].x>=p[right].x+.65*w&&p[le].x<=p[left].x-.25*w&&p[re].x>=p[right].x+.25*w;
 const overhead=p[15].y<y-.45*w&&p[16].y<y-.45*w&&p[13].y<y-.2*w&&p[14].y<y-.2*w&&Math.abs(p[15].x-p[16].x)>=.4*w;
 if(s.phase==='hold'){
  const target=s.gesture==='sideways'?sideways:overhead;
  if(!target)return {...s,lastTimestamp:t,heldAt:null,holdFrames:0};
  const heldAt=s.heldAt??t,holdFrames=s.holdFrames+1;
  return {...s,lastTimestamp:t,heldAt,holdFrames,phase:t-heldAt>=600&&holdFrames>=7?'lower':'hold'};
 }
 if(s.heldAt===null||t-s.heldAt>8000)return reset();
 const lowerFrames=neutral?s.lowerFrames+1:0;
 if(lowerFrames>=3){const next=initialLanternArms(s.count+1);return {...next,lastTimestamp:t,phase:next.phase==='complete'?'complete':'hold',anchorX:s.anchorX,anchorY:s.anchorY,anchorWidth:s.anchorWidth,calibrationFrames:8};}
 return {...s,lastTimestamp:t,lowerFrames};
}
