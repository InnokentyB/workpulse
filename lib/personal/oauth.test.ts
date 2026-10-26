// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readdir, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { GET as start } from '@/app/api/personal/google/start/route';
import { GET as callback } from '@/app/api/calendar/google/callback/route';
import { GET, POST } from '@/app/api/personal/route';
import { FLOW_COOKIE, seal } from '@/lib/calendar/google-oauth';
import { newRecord } from './service';
import { connectionId, personalConfig, saveRecord, readRecord, serialized } from './store';
import { finishPersonalOAuth } from './oauth';
const secret='private-unit-session-key-'.repeat(3);
let dir:string;
beforeEach(async()=>{dir=await mkdtemp(join(tmpdir(),'personal-test-oauth-'));vi.stubEnv('WORKPULSE_PERSONAL_TEST','');vi.stubEnv('WORKPULSE_PERSONAL_DATA_DIR',dir);vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','unit-client');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_SECRET','unit-secret');vi.stubEnv('GOOGLE_CALENDAR_REDIRECT_URI','http://localhost:3000/api/calendar/google/callback');vi.stubEnv('CALENDAR_SESSION_SECRET',secret);});
afterEach(async()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true});});
const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
describe('personal Google lifecycle',()=>{
 it('requests offline access with same minimal scopes and PKCE',async()=>{const r=await start(new NextRequest('http://localhost:3000/api/personal/google/start'));const u=new URL(r.headers.get('location')!);expect(u.searchParams.get('access_type')).toBe('offline');expect(u.searchParams.get('code_challenge_method')).toBe('S256');expect(u.searchParams.get('scope')).not.toContain('auth/calendar ');expect(r.headers.get('set-cookie')).toContain('HttpOnly');});
 it('stores refresh credentials server-side and returns only opaque cookie',async()=>{const fetch=vi.fn().mockResolvedValueOnce(response({access_token:'secret-access',refresh_token:'secret-refresh',expires_in:3600,token_type:'Bearer',scope:'https://www.googleapis.com/auth/calendar.events.freebusy https://www.googleapis.com/auth/calendar.calendarlist.readonly'})).mockResolvedValueOnce(response({items:[{id:'primary',summary:'My calendar',primary:true}]}));vi.stubGlobal('fetch',fetch);const flow=seal({state:'state',verifier:'verifier',purpose:'personal',expiresAt:Date.now()+60000},secret);const r=await callback(new NextRequest('http://localhost:3000/api/calendar/google/callback?state=state&code=code',{headers:{cookie:`${FLOW_COOKIE}=${flow}`}}));expect(r.headers.get('location')).toBe('http://localhost:3000/personal?connected=1');const cookie=r.headers.get('set-cookie')!;expect(cookie).toContain('workpulse_personal=');expect(cookie).not.toContain('secret-access');expect(cookie).not.toContain('secret-refresh');expect(await readdir(dir)).toHaveLength(1);});
 it('refreshes an expired access token without exposing either credential',async()=>{const c=personalConfig()!,id=connectionId(),record=newRecord('old-access','server-refresh',Date.now()-100);record.calendars=[{id:'primary',name:'Primary',primary:true}];record.selected=['primary'];record.workStartedAt=Date.now()-50*60000;record.dueAt=Date.now()-60000;await saveRecord(id,record,c);const fetch=vi.fn().mockResolvedValueOnce(response({access_token:'fresh-access',expires_in:3600,token_type:'Bearer'})).mockResolvedValueOnce(response({calendars:{primary:{busy:[]}}}));vi.stubGlobal('fetch',fetch);const r=await GET(new NextRequest('http://localhost:3000/api/personal?refresh=1',{headers:{cookie:`workpulse_personal=${id}`}}));const data=await r.json();expect(r.status).toBe(200);expect(data.decision).toBe('move');expect(JSON.stringify(data)).not.toMatch(/fresh-access|server-refresh/);expect(fetch.mock.calls[0][1].body.get('grant_type')).toBe('refresh_token');});
 it('revoked refresh authorization fails closed',async()=>{const c=personalConfig()!,id=connectionId(),record=newRecord('expired','revoked',Date.now()-1);record.selected=['primary'];await saveRecord(id,record,c);vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({error:'invalid_grant'},400)));const r=await GET(new NextRequest('http://localhost:3000/api/personal?refresh=1',{headers:{cookie:`workpulse_personal=${id}`}}));expect(r.status).toBe(401);expect(await r.text()).not.toContain('revoked');});
 it('disconnect deletes local state even when provider revoke fails',async()=>{const id=connectionId();await saveRecord(id,newRecord('access','refresh',Date.now()+60000),personalConfig()!);vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('network')));const r=await POST(new NextRequest('http://localhost:3000/api/personal',{method:'POST',headers:{origin:'http://localhost:3000',cookie:`workpulse_personal=${id}`},body:JSON.stringify({action:'disconnect'})}));expect(r.status).toBe(200);expect((await r.json()).warning).toContain('Local connection removed');expect(await readdir(dir)).toEqual([]);});
 it('cannot resurrect the old connection when OAuth replacement races its refresh',async()=>{
  const config=personalConfig()!,previous=connectionId();await saveRecord(previous,newRecord('old-access','old-refresh',Date.now()+60000),config);
  let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>{release=r;}),hasEntered=new Promise<void>(r=>{entered=r;});
  const oldRefresh=serialized(previous,config,async()=>{const record=(await readRecord(previous,config))!;entered();await gate;await saveRecord(previous,record,config);});await hasEntered;
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({items:[{id:'primary',primary:true}]})));
  const replacement=finishPersonalOAuth(new NextRequest('http://localhost:3000/api/calendar/google/callback'),{access_token:'new-access',refresh_token:'new-refresh',expires_in:3600},previous);
  await Promise.race([replacement,new Promise(r=>setTimeout(r,100))]);release();const [result]=await Promise.all([replacement,oldRefresh]);
  expect(result.headers.get('location')).toContain('connected=1');expect(await readRecord(previous,config)).toBeNull();expect(await readdir(dir)).toHaveLength(1);
 });

 it('removes a newly stored credential if replacing the previous connection fails',async()=>{
  const config=personalConfig()!,previous=connectionId();await saveRecord(previous,newRecord('old','old-refresh',Date.now()+60000),config);const original=(await readdir(dir))[0];await unlink(join(dir,original));await mkdir(join(dir,original));
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({items:[]})));
  const r=await finishPersonalOAuth(new NextRequest('http://localhost:3000/api/calendar/google/callback'),{access_token:'new',refresh_token:'new-refresh',expires_in:3600},previous);
  expect(r.headers.get('location')).toContain('error=connection');expect(await readdir(dir)).toEqual([original]);
 });

});
