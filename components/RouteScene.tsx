import type {CameraPose} from '@/lib/camera-avatar';
import {CameraAvatar} from './CameraAvatar';
type Props={count:number;goal:'trail'|'workshop';target?:number;mode?:'route'|'exercise'|'arms';pose?:CameraPose|null;poseStatus?:'off'|'tracking'|'lost'};
export default function RouteScene({count,goal,target=8,mode='route',pose=null,poseStatus='off'}:Props){
 const safeTarget=Number.isFinite(target)&&target>0?target:8;
 const completed=Math.max(0,Math.min(safeTarget,count)),fraction=completed/safeTarget,finished=completed===safeTarget;
 const route=mode==='route',arms=mode==='arms',gateOpen=mode==='arms'?completed>=2:completed>=7,trail=goal==='trail';
 const positions=[[45,235],[95,215],[145,195],[195,175],[245,155],[295,135],[345,115],[385,90],[410,80]];
 const index=route?Math.min(8,completed):fraction*8;
 const lower=Math.floor(index),upper=Math.min(8,Math.ceil(index)),mix=index-lower;
 const x=positions[lower][0]+(positions[upper][0]-positions[lower][0])*mix;
 const y=trail?positions[lower][1]+(positions[upper][1]-positions[lower][1])*mix:230;
 const gateY=trail?arms?155:115:230,lampY=trail?40:183;
 const caption=finished?trail?'Summit reached · lantern lit':'Workshop reached · lantern lit':arms?completed<2?`${completed} of 2 movements saved · open the gate`:'Gate opened · repeat sideways and overhead to light the lantern':route?completed<6?`${6-completed} walking steps to the gate`:completed===6?'Gate reached · open your arms sideways':'Gate opened · raise your arms to light the lantern':`${completed} of ${safeTarget} movements saved · ${trail?'climb to the summit':'reach the workshop'}`;
 const poseText=poseStatus==='off'?'Camera off · neutral character':pose?'Character follows your camera · position advances only after saving':'Tracking lost · frame your body to move the character';
 return <section className="route-scene" aria-label="Route progress" data-testid="route-scene">
  <svg viewBox="0 0 460 265" role="img" aria-label={`${trail?'Mountain trail':'Workshop path'} · ${caption}`}>
   {trail?<><path d="M20 248L115 177L163 185L248 117L276 132L400 65L445 101V248Z" fill="#dce4d5" stroke="#c1ceb9" strokeWidth="2"/><path d="M364 85L400 65L426 84L406 82L395 91L388 82Z" fill="#faf9f3"/><path data-testid="mountain-path" d="M25 243L45 235L95 215L145 195L195 175L245 155L295 135L345 115L385 90L410 80" stroke="currentColor" strokeWidth="3" fill="none" opacity=".4"/></>:<><path d="M25 230H440" stroke="currentColor" strokeWidth="3" opacity=".4"/><path d="M360 197V161L395 143L430 161V197M370 197V173H420V197" stroke="currentColor" strokeWidth="2" fill="#e2e8d9"/></>}
   {Array.from({length:route?7:safeTarget+1},(_,i)=>{const p=route?positions[i]:[45+(410-45)*i/safeTarget,235+(80-235)*i/safeTarget];return <circle key={i} cx={p[0]} cy={trail?p[1]:230} r="3" fill="currentColor" opacity=".45"/>;})}
   {(route||arms)&&<g transform={`translate(${arms?257:357} ${gateY})`} className={gateOpen?'route-gate route-gate--open':'route-gate'} stroke="currentColor" fill="none" strokeWidth="3"><path d="M-13 0V-43H13V0"/><g className="route-gate__leaf" transform={gateOpen?'scale(.15 1)':undefined}><path d="M-11-40H11V0H-11Z M-4-40V0M4-40V0"/></g></g>}
   <CameraAvatar pose={poseStatus==='tracking'?pose:null} x={x} y={y}/>
   <g transform={`translate(433 ${lampY})`} className={finished?'route-lantern route-lantern--lit':'route-lantern'}><circle r="17" fill={finished?'#e9b94e':'transparent'} opacity=".45"/><path d="M-6-6H6V10H-6Z M-4-6V-11H4V-6" fill={finished?'#f5c858':'none'} stroke="currentColor" strokeWidth="2.5"/></g>
  </svg>
  <p>{caption}</p><p className="personal-small" data-testid="camera-pose-status" aria-live="polite">{poseText}</p>
 </section>;
}
