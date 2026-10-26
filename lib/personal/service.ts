import { randomBytes } from 'node:crypto';
import { createGoogleCalendarAdapter } from '@/lib/calendar/google';
import { getExercise } from './exercises';
import { forecast, mergeBusy } from './forecast';
import type { PersonalConfig } from './store';
import { PersonalError } from './store';
import type { Goal, PersonalRecord, PersonalState } from './types';
const MINUTE=60000;
export function emptyState(configured:boolean):PersonalState{return {configured,connected:false,selected:[],workStartedAt:null,dueAt:null,lastCompletedAt:null,history:[],run:null,availability:null,timeline:null,breakForecast:null,forecastReason:'unknown',decision:'setup'};}
export function newRecord(accessToken:string,refreshToken:string,expiresAt:number):PersonalRecord{return {version:1,accessToken,refreshToken,expiresAt,calendars:[],selected:[],selectionVersion:0,workStartedAt:null,dueAt:null,lastCompletedAt:null,history:[],run:null,availability:null};}
async function googleFetch(url:string,options:RequestInit={}){return fetch(url,{...options,cache:'no-store',signal:AbortSignal.timeout(10000)});}
async function readGoogleJson<T>(response:Response):Promise<T>{try{return await response.json() as T;}catch{throw new PersonalError(502,'Invalid Google response.');}}
export async function access(record:PersonalRecord,config:PersonalConfig){
 if(config.test)return record.accessToken;
 if(record.expiresAt>Date.now()+30000)return record.accessToken;
 const google=config.google!;let r:Response;try{r=await googleFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:record.refreshToken,client_id:google.clientId,client_secret:google.clientSecret})});}catch{throw new PersonalError(502,'Google connection is unavailable.');}
 if(!r.ok)throw new PersonalError(r.status===400||r.status===401?401:502,'Reconnect Google Calendar.');
 const token=await readGoogleJson<{access_token?:unknown;expires_in?:unknown;token_type?:unknown}>(r);if(typeof token.access_token!=='string'||token.token_type!=='Bearer'||typeof token.expires_in!=='number'||!Number.isFinite(token.expires_in)||token.expires_in<=60)throw new PersonalError(502,'Invalid Google authorization response.');
 record.accessToken=token.access_token;record.expiresAt=Date.now()+token.expires_in*1000;return record.accessToken;
}
export async function readCalendars(record:PersonalRecord,config:PersonalConfig){
 if(config.test){record.calendars=[{id:'primary',name:'Fixture calendar',primary:true},{id:'secondary',name:'Second fixture calendar',primary:false}];return;}
 const token=await access(record,config);const all:PersonalRecord['calendars']=[];let pageToken:string|undefined;
 for(let page=0;page<4;page++){
  const url=new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');url.searchParams.set('maxResults','100');url.searchParams.set('minAccessRole','freeBusyReader');if(pageToken)url.searchParams.set('pageToken',pageToken);
  let r:Response;try{r=await googleFetch(url.toString(),{headers:{Authorization:`Bearer ${token}`}});}catch{throw new PersonalError(502,'Google calendars are unavailable.');}
  if(!r.ok)throw new PersonalError(r.status===401?401:502,'Reconnect or retry Google Calendar.');const data=await readGoogleJson<{items?:Array<{id?:unknown;summary?:unknown;primary?:unknown}>;nextPageToken?:unknown}>(r);if(!Array.isArray(data.items))throw new PersonalError(502,'Invalid Google calendar list.');
  for(const item of data.items)if(typeof item.id==='string')all.push({id:item.id,name:typeof item.summary==='string'?item.summary:'Calendar',primary:item.primary===true});pageToken=typeof data.nextPageToken==='string'?data.nextPageToken:undefined;if(!pageToken)break;
 }
 if(pageToken)throw new PersonalError(502,'Too many calendars; cannot load the complete list.');record.calendars=all;
}
export function fresh(record:PersonalRecord,now=Date.now()){const a=record.availability;return !!a&&a.selectionVersion===record.selectionVersion&&a.observedAt<=now&&now-a.observedAt<=90000&&a.horizonEnd>=now+5*MINUTE&&forecast(record,now).timeline!==null;}
export async function refresh(record:PersonalRecord,c:PersonalConfig){
 record.availability=null;if(!record.selected.length)return;
 const now=Date.now(),horizonEnd=now+8*60*MINUTE;
 const snapshot=(busy:Parameters<typeof mergeBusy>[0])=>{const merged=mergeBusy(busy,now,horizonEnd),current=merged.find(p=>p.start<=now&&p.end>now),next=merged.find(p=>p.start>now);record.availability={observedAt:now,horizonStart:now,horizonEnd,selectionVersion:record.selectionVersion,busy:merged,isBusy:!!current,freeMinutes:current?0:((next?.start??horizonEnd)-now)/MINUTE,reason:current?'A selected calendar is busy now.':'Calendar time is free now.'};};
 if(c.test){if(record.fixture==='unavailable')throw new PersonalError(502,'Fixture provider unavailable.');snapshot(record.fixture==='busy'?[{start:now,end:now+15*MINUTE}]:record.fixture==='blocked'?[{start:now,end:horizonEnd}]:[]);if(record.fixture==='stale')record.availability!.observedAt=now-91000;return;}
 const token=await access(record,c);
 try{const result=await createGoogleCalendarAdapter((url,options)=>googleFetch(String(url),options)).readAvailability({credential:{accessToken:token},calendarIds:record.selected,timeMin:new Date(now).toISOString(),timeMax:new Date(horizonEnd).toISOString()});snapshot(result.busy.map(p=>({start:Date.parse(p.start),end:Date.parse(p.end)})));}
 catch(error){if(error instanceof PersonalError)throw error;const auth=(error as {code?:string}).code==='authentication-failed';throw new PersonalError(auth?401:502,auth?'Reconnect Google Calendar.':'Calendar availability is unknown. Retry.');}
}
export function state(record:PersonalRecord):PersonalState{
 const now=Date.now(),prediction=forecast(record,now),timeline=prediction.timeline;
 const current=timeline?.busy.find(p=>p.start<=now&&p.end>now),next=timeline?.busy.find(p=>p.start>now);
 const availability=timeline?{observedAt:timeline.observedAt,isBusy:!!current,freeMinutes:current?0:((next?.start??timeline.end)-now)/MINUTE,reason:current?'A selected calendar is busy now.':'Calendar time is free now.'}:null;
 return {configured:true,connected:true,calendars:record.calendars,selected:record.selected,workStartedAt:record.workStartedAt,dueAt:record.dueAt,lastCompletedAt:record.lastCompletedAt,history:record.history,run:record.run?{id:record.run.id,goal:record.run.goal,count:record.run.count,status:record.run.status,...(record.run.exerciseId?{exerciseId:record.run.exerciseId}:{}),...(record.run.source?{source:record.run.source}:{}),...(record.run.target!==undefined?{target:record.run.target}:{}),...(record.run.startedAt!==undefined?{startedAt:record.run.startedAt}:{}),...(record.run.movementVersion?{movementVersion:record.run.movementVersion}:{})}:null,availability,...prediction,decision:!record.workStartedAt?'start-work':!timeline?'unknown':prediction.breakForecast?.start===now?'move':'wait'};
}
export async function mutate(record:PersonalRecord,body:Record<string,unknown>,c:PersonalConfig):Promise<string|undefined>{
 const now=Date.now();switch(body.action){
 case 'select':{const ids=body.calendarIds;if(!Array.isArray(ids)||ids.length<1||ids.length>20||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||id.length>256||!record.calendars.some(x=>x.id===id)))throw new PersonalError(400,'Choose 1–20 listed calendars.');if(record.run&&record.run.status!=='complete')throw new PersonalError(409,'Finish or cancel the current run first.');record.selected=ids;record.selectionVersion++;record.availability=null;break;}
 case 'start-work':if(record.run&&record.run.status!=='complete')throw new PersonalError(409,'Finish or cancel the current run first.');record.workStartedAt=now;record.dueAt=now+45*MINUTE;break;
 case 'snooze':case 'skip':if(!record.workStartedAt)throw new PersonalError(409,'Start a work session first.');record.dueAt=now+(body.action==='snooze'?20:45)*MINUTE;break;
 case 'refresh':await refresh(record,c);break;
 case 'start-run':case 'start-exercise':case 'resume-run':{
  const resume=body.action==='resume-run';
  if(!resume&&record.run&&record.run.status!=='complete')throw new PersonalError(409,'A run is already in progress.');
  if(resume&&(!record.run||record.run.id!==body.runId||record.run.status==='complete'))throw new PersonalError(409,'No unfinished run to resume.');
  const chosen=body.action==='start-exercise'||(resume&&record.run!.source==='chosen');
  const exercise=resume?undefined:getExercise(body.action==='start-run'&&body.exerciseId===undefined?'lantern-route':body.exerciseId);
  if(!resume&&!exercise)throw new PersonalError(400,'Choose a listed exercise.');
  const goal=body.goal===undefined&&chosen?'trail':body.goal;
  if(!resume&&goal!=='trail'&&goal!=='workshop')throw new PersonalError(400,'Choose a challenge goal.');
  if(!chosen){
   if(!record.workStartedAt)throw new PersonalError(409,'Start a work session first.');
   if(!fresh(record))await refresh(record,c);const s=state(record);if(s.decision!=='move')throw new PersonalError(409,'A fresh suitable calendar window and due break are required.');
  }
  if(!resume){record.version=exercise!.id==='lantern-arms'||record.version===3?3:2;record.run={...(exercise!.id==='lantern-route'?{movementVersion:'route-v1' as const}:{}),exerciseId:exercise!.id,source:chosen?'chosen':'scheduled',target:exercise!.target,startedAt:now,id:randomBytes(16).toString('hex'),goal:goal as Goal,count:0,status:'active',lease:randomBytes(24).toString('base64url'),updatedAt:now};}
  else{record.run!.lease=randomBytes(24).toString('base64url');record.run!.status='active';record.run!.updatedAt=now;}
  return record.run!.lease;
 }
 case 'discard-run':{
  if(!record.run||record.run.id!==body.runId||record.run.status==='complete')throw new PersonalError(409,'No matching unfinished run to discard.');
  record.run=null;break;
 }
 case 'progress':case 'pause-run':case 'cancel-run':{
  const run=record.run;if(!run||run.id!==body.runId||typeof body.lease!=='string'||run.lease!==body.lease)throw new PersonalError(409,'This run changed in another tab. Resume again.');
  if(body.action==='cancel-run'){if(run.status==='complete')throw new PersonalError(409,'Completed run cannot be cancelled.');record.run=null;break;}
  if(body.action==='pause-run'){if(run.status==='complete')throw new PersonalError(409,'Run is already complete.');run.status='paused';run.updatedAt=now;break;}
  if((run.exerciseId==='neck-reset'||run.exerciseId==='shoulder-rolls'||run.exerciseId==='lantern-arms')&&body.exerciseId!==run.exerciseId)throw new PersonalError(409,'Reload My day to use this exercise.');
  const target=getExercise(run.exerciseId)?.target??8;
  if(!Number.isInteger(body.count)||Number(body.count)<1||Number(body.count)>target)throw new PersonalError(400,'Invalid recognized step count.');
  if(body.count===run.count)break;
  if(run.status!=='active'||body.count!==run.count+1)throw new PersonalError(409,'Recognized steps must be saved in order.');
  run.count=Number(body.count);run.updatedAt=now;if(run.count===target){run.status='complete';record.history=[...record.history,{id:run.id,goal:run.goal,steps:target,completedAt:now,...(run.exerciseId?{exerciseId:run.exerciseId}:{}),...(run.source?{source:run.source}:{}),...(typeof run.startedAt==='number'&&Number.isFinite(run.startedAt)?{elapsedSeconds:Math.max(0,Math.floor((now-run.startedAt)/1000))}:{}),...(run.movementVersion?{movementVersion:run.movementVersion}:{})}].slice(-100);record.lastCompletedAt=now;if(record.workStartedAt===null)record.workStartedAt=now;record.dueAt=now+45*MINUTE;}break;
 }
 default:throw new PersonalError(400,'Unknown workday action.');
 }return undefined;
}
