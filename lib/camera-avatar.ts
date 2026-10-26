import type {PoseLandmark} from './neck-motion-tracker';
export type AvatarPoint={x:number;y:number};
export type CameraPose={joints:Partial<Record<number,AvatarPoint>>;framing:'full'|'upper'|'torso'|'arms'};
export const AVATAR_BONES=[[11,12],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[11,13],[12,14],[13,15],[14,16]] as const;
const JOINTS=[0,11,12,13,14,15,16,23,24,25,26,27,28];
function visible(p:PoseLandmark|undefined):p is PoseLandmark{return Boolean(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.visibility)&&(p.visibility??0)>=.65&&p.x>=.015&&p.x<=.985&&p.y>=.015&&p.y<=.985);}
/** Ephemeral display projection only. It does not recognize or award movement. */
export function projectCameraPose(points:PoseLandmark[],framing:'full'|'upper'|'torso'|'arms'):CameraPose|null{
 const required=framing==='full'?[0,11,12,23,24,25,26,27,28]:framing==='torso'?[0,11,12,23,24]:framing==='arms'?[0,11,12,13,14,15,16]:[0,11,12];
 if(required.some(i=>!visible(points[i])))return null;
 const width=Math.abs(points[12].x-points[11].x);if(width<.08)return null;
 const displayed=framing==='arms'?JOINTS.filter(i=>i<23):JOINTS;
 const hips=framing!=='arms'&&visible(points[23])&&visible(points[24]);
 const anchorX=hips?(points[23].x+points[24].x)/2:(points[11].x+points[12].x)/2;
 const anchorY=hips?(points[23].y+points[24].y)/2:(points[11].y+points[12].y)/2;
 const shoulderY=(points[11].y+points[12].y)/2;
 if((framing==='full'||framing==='torso')&&anchorY-shoulderY<.12)return null;
 if(framing==='full'&&Math.min(points[27].y,points[28].y)<=anchorY+.15)return null;
 const baseY=hips?-26:-36;
 let scale=22/width;
 // Fit the whole observed silhouette; an arm above the head never clips the scene.
 for(const i of displayed){const p=points[i];if(!visible(p))continue;const dx=p.x-anchorX,dy=p.y-anchorY;
  if(dx!==0)scale=Math.min(scale,28/Math.abs(dx));
  if(dy<0)scale=Math.min(scale,(-72-baseY)/dy);
  if(dy>0)scale=Math.min(scale,(8-baseY)/dy);
 }
 const joints:CameraPose['joints']={};for(const i of displayed){const p=points[i];if(visible(p))joints[i]={x:(p.x-anchorX)*scale,y:baseY+(p.y-anchorY)*scale};}
 return {joints,framing};
}
