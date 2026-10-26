import type {PoseLandmark} from './neck-motion-tracker';
import {initialStepTouchState,updateStepTouch,type StepTouchState} from './step-touch-tracker';
export type RouteState = StepTouchState & {armPhase:'hold'|'lower';heldAt:number|null;holdFrames:number;lowerFrames:number};
export function initialRouteState(count=0):RouteState{return {...initialStepTouchState(count),armPhase:'hold',heldAt:null,holdFrames:0,lowerFrames:0};}
function reset(s:RouteState,t:number):RouteState{return {...initialRouteState(s.count),lastTimestamp:t};}
/** Six alternating steps, a sideways gate gesture, then an overhead lantern gesture.
 * Both arm gestures require a continuous 600ms/7-frame hold and a neutral return.
 */
export function updateRoute(s:RouteState,p:PoseLandmark[],t:number):RouteState{
 if(!Number.isFinite(t)||t<=s.lastTimestamp)return s;
 if(s.count===8)return {...s,lastTimestamp:t};
 if(s.count<6){const next=updateStepTouch(s,p,t);return next.count===6?{...initialRouteState(6),lastTimestamp:t}:{...s,...next};}
 if(s.lastTimestamp>=0&&t-s.lastTimestamp>750)return reset(s,t);
 const joints=[11,12,13,14,15,16];
 if(joints.some(i=>!p[i]||!Number.isFinite(p[i].x)||!Number.isFinite(p[i].y)||!Number.isFinite(p[i].visibility)||(p[i].visibility??0)<.65||p[i].x<.015||p[i].x>.985||p[i].y<.015||p[i].y>.985))return reset(s,t);
 const w=Math.abs(p[12].x-p[11].x),y=(p[11].y+p[12].y)/2;
 const neutral=p[15].y>y+.65*w&&p[16].y>y+.65*w&&p[13].y>y+.2*w&&p[14].y>y+.2*w;
 // Reuse full-body framing/calibration, while disabling its step counter in arm stages.
 const body=updateStepTouch({...s,phase:s.phase==='calibrating'?'calibrating':'step',stableFrames:0,openedAt:null},p,t);
 if(body.tracking==='lost')return reset(s,t);
 if(s.phase==='calibrating')return neutral?{...s,...body}:reset(s,t);
 const feetClose=Math.abs(p[28].x-p[27].x)<=s.baselineSpan+.15*w;
 const hip=(p[23].x+p[24].x)/2;
 if(!feetClose||Math.abs(hip-s.baselineHip)>.2*w)return {...s,lastTimestamp:t,heldAt:null,holdFrames:0,lowerFrames:0,armPhase:'hold'};
 const left=p[11].x<p[12].x?11:12,right=left===11?12:11;
 const le=left+2,re=right+2,lw=left+4,rw=right+4;
 const sideways=[le,re,lw,rw].every(i=>Math.abs(p[i].y-y)<=.35*w)&&p[lw].x<=p[left].x-.65*w&&p[rw].x>=p[right].x+.65*w&&p[le].x<=p[left].x-.25*w&&p[re].x>=p[right].x+.25*w;
 const overhead=p[15].y<y-.45*w&&p[16].y<y-.45*w&&p[13].y<y-.2*w&&p[14].y<y-.2*w&&Math.abs(p[15].x-p[16].x)>=.4*w;
 const target=s.count===6?sideways:overhead;
 const next={...s,lastTimestamp:t,tracking:'ready' as const};
 if(s.armPhase==='hold'){
  if(!target)return {...next,heldAt:null,holdFrames:0};
  const heldAt=s.heldAt??t,holdFrames=s.holdFrames+1;
  return {...next,heldAt,holdFrames,armPhase:t-heldAt>=600&&holdFrames>=7?'lower':'hold'};
 }
 if(t-(s.heldAt??t)>8000)return reset(s,t);
 const lowerFrames=neutral?s.lowerFrames+1:0;
 if(lowerFrames>=3)return {...initialRouteState(s.count+1),lastTimestamp:t};
 return {...next,lowerFrames};
}
