import {AVATAR_BONES,type CameraPose} from '@/lib/camera-avatar';
/** This silhouette is driven only by this frame's observed landmarks. */
export function CameraAvatar({pose,x,y}:{pose:CameraPose|null;x:number;y:number}){
 return <g data-testid="camera-avatar" data-live-pose={Boolean(pose)} data-route-x={x} data-route-y={y} transform={`translate(${x} ${y})`} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
  {pose?<>
   {AVATAR_BONES.map(([a,b])=>{const p=pose.joints[a],q=pose.joints[b];return p&&q?<line key={`${a}-${b}`} data-bone={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y}/>:null;})}
   {Object.entries(pose.joints).map(([id,p])=>p?<circle key={id} data-joint={id} cx={p.x} cy={p.y} r={id==='0'?5:1.5} fill={id==='0'?'var(--paper, #faf9f3)':'currentColor'} strokeWidth={id==='0'?2.5:1}/>:null)}
  </>:<g opacity=".45" strokeDasharray="3 4"><circle cx="0" cy="-45" r="5"/><path d="M0-38V-18M-13-31L0-35L13-31M0-18L-8 0M0-18L8 0"/></g>}
 </g>;
}
