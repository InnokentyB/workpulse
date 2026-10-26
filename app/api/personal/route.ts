import { trustedPublicOrigin, publicCookieSecure } from '@/lib/calendar/public-origin';
import { NextRequest, NextResponse } from 'next/server';
import { PERSONAL_COOKIE, PersonalError, connectionId, personalConfig, readRecord, removeRecord, saveRecord, serialized, validId } from '@/lib/personal/store';
import { emptyState, mutate, newRecord, readCalendars, refresh, state } from '@/lib/personal/service';
export const runtime='nodejs';
const options=(request:NextRequest)=>({httpOnly:true,sameSite:'lax' as const,secure:publicCookieSecure(request),path:'/api/personal',maxAge:30*24*60*60});
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});}
function failure(error:unknown){return json({error:error instanceof PersonalError?error.message:'Personal workday is unavailable.'},error instanceof PersonalError?error.status:503);}
export async function GET(request:NextRequest){
 if(!trustedPublicOrigin(request))return json({error:'Invalid host.'},403);
 try{const config=personalConfig();if(!config)return json(emptyState(false));const id=request.cookies.get(PERSONAL_COOKIE)?.value;if(!validId(id))return json(emptyState(true));
 return await serialized(id,config,async()=>{const record=await readRecord(id,config);if(!record)return json(emptyState(true));if(request.nextUrl.searchParams.get('refresh')==='1'){try{await refresh(record,config);}catch(e){await saveRecord(id,record,config);throw e;}await saveRecord(id,record,config);}return json(state(record));});
 }catch(error){return failure(error);}
}
export async function POST(request:NextRequest){
 const origin=trustedPublicOrigin(request);
 if(!origin||request.headers.get('origin')!==origin)return json({error:'Invalid origin.'},403);
 try{const config=personalConfig();if(!config)return json({error:'Google Calendar configuration is required.'},503);let body:Record<string,unknown>;try{const value=await request.json();if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();body=value;}catch{return json({error:'Invalid request.'},400);}
 if(body.action==='__fixture'){
  if(!config.test)return json({error:'Unknown workday action.'},400);
  if(!['due','busy','blocked','stale','unavailable'].includes(String(body.scenario)))return json({error:'Invalid fixture.'},400);
  const id=connectionId();const record=newRecord('fixture-access','fixture-refresh',Date.now()+3600000);record.fixture=body.scenario as 'due'|'busy'|'blocked'|'stale'|'unavailable';await readCalendars(record,config);record.selected=['primary'];record.workStartedAt=Date.now()-46*60000;record.dueAt=Date.now()-60000;
  try{await refresh(record,config);}catch{record.availability=null;}await saveRecord(id,record,config);const response=json(state(record));response.cookies.set(PERSONAL_COOKIE,id,options(request));return response;
 }
 const id=request.cookies.get(PERSONAL_COOKIE)?.value;if(!validId(id))return json({error:'Connect Google Calendar first.'},401);
 return await serialized(id,config,async()=>{const record=await readRecord(id,config);if(!record)return json({error:'Reconnect Google Calendar.'},401);
  if(body.action==='disconnect'){
   // Local deletion is the authoritative disconnect, even if Google revoke is down.
   await removeRecord(id,config);let warning:string|undefined;
   if(!config.test){try{const r=await fetch('https://oauth2.googleapis.com/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:record.refreshToken}),signal:AbortSignal.timeout(10000)});if(!r.ok)warning='Local connection removed. Remove WorkPulse access in your Google Account if revocation did not complete.';}catch{warning='Local connection removed. Check WorkPulse access in your Google Account.';}}
   const response=json({...emptyState(true),...(warning?{warning}:{})});response.cookies.set(PERSONAL_COOKIE,'',{...options(request),maxAge:0});return response;
  }
  let lease:string|undefined;try{lease=await mutate(record,body,config);}catch(error){if(error instanceof PersonalError&&(error.status===401||error.status===502)){record.availability=null;await saveRecord(id,record,config);}throw error;}
  await saveRecord(id,record,config);return json({...state(record),...(lease?{runLease:lease}:{})});
 });
 }catch(error){return failure(error);}
}
