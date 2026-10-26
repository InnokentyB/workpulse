// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { GET as personalStart } from '@/app/api/personal/google/start/route';
import { GET as legacyStart } from '@/app/api/calendar/google/start/route';
import { GET as callback } from '@/app/api/calendar/google/callback/route';
import { POST as personalPost } from '@/app/api/personal/route';
import { POST as legacyDisconnect } from '@/app/api/calendar/google/disconnect/route';
import { FLOW_COOKIE, seal } from './google-oauth';
let dir:string;
const secret='origin-unit-private-key-'.repeat(3);
const internal=(path:string,headers:Record<string,string>={},method='GET',body?:unknown)=>new NextRequest('http://0.0.0.0:3000'+path,{method,headers:{host:'127.0.0.1:13001',...headers},...(body?{body:JSON.stringify(body)}:{})});
beforeEach(async()=>{dir=await mkdtemp(join(tmpdir(),'personal-test-origin-'));vi.stubEnv('WORKPULSE_PUBLIC_ORIGIN','http://127.0.0.1:13001');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','unit-client');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_SECRET','unit-secret');vi.stubEnv('GOOGLE_CALENDAR_REDIRECT_URI','http://127.0.0.1:13001/api/calendar/google/callback');vi.stubEnv('CALENDAR_SESSION_SECRET',secret);vi.stubEnv('WORKPULSE_PERSONAL_DATA_DIR',dir);vi.stubEnv('WORKPULSE_PERSONAL_TEST','');});
afterEach(async()=>{vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true});});
describe('trusted public origin behind Docker',()=>{
 it('starts personal and legacy OAuth using configured public Host despite internal URL',async()=>{for(const start of [personalStart,legacyStart]){const r=await start(internal('/api/personal/google/start'));expect(r.status).toBe(307);expect(new URL(r.headers.get('location')!).hostname).toBe('accounts.google.com');}});
 it('does not trust arbitrary forwarded Host or mismatching actual Host',async()=>{const r=await personalStart(internal('/api/personal/google/start',{host:'attacker.test','x-forwarded-host':'127.0.0.1:13001','x-forwarded-proto':'http'}));expect(r.status).toBe(403);});
 it('redirects callback errors to public origin, never internal0.0.0.0',async()=>{const flow=seal({state:'state',verifier:'verifier',purpose:'personal',expiresAt:Date.now()+60000},secret);const r=await callback(internal('/api/calendar/google/callback?state=state&error=access_denied',{cookie:`${FLOW_COOKIE}=${flow}`}));expect(r.headers.get('location')).toBe('http://127.0.0.1:13001/personal?error=denied');});
 it('uses public origin for setup errors and secure-cookie policy',async()=>{vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','');expect((await legacyStart(internal('/api/calendar/google/start'))).headers.get('location')).toBe('http://127.0.0.1:13001/calendar?error=configuration');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','unit-client');vi.stubEnv('WORKPULSE_PUBLIC_ORIGIN','https://workpulse.example');vi.stubEnv('GOOGLE_CALENDAR_REDIRECT_URI','https://workpulse.example/api/calendar/google/callback');const r=await personalStart(internal('/api/personal/google/start',{host:'workpulse.example','x-forwarded-proto':'http'}));expect(r.headers.get('set-cookie')).toContain('Secure');});
 it('accepts correct external Origin for personal writes but rejects mismatches',async()=>{vi.stubEnv('WORKPULSE_PUBLIC_ORIGIN','http://127.0.0.1:4172');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_SECRET','');vi.stubEnv('WORKPULSE_PERSONAL_TEST','1');vi.stubEnv('WORKPULSE_PERSONAL_TEST_SECRET',secret);const body={action:'__fixture',scenario:'due'};const headers={host:'127.0.0.1:4172',origin:'http://127.0.0.1:4172'};expect((await personalPost(internal('/api/personal',headers,'POST',body))).status).toBe(200);expect((await personalPost(internal('/api/personal',{...headers,origin:'https://evil.test'},'POST',body))).status).toBe(403);expect((await personalPost(internal('/api/personal',{...headers,host:'evil.test'},'POST',body))).status).toBe(403);});
 it('accepts legacy disconnect from external trusted origin',async()=>{const r=await legacyDisconnect(internal('/api/calendar/google/disconnect',{origin:'http://127.0.0.1:13001'},'POST',{}));expect(r.status).toBe(200);});
 it('falls back to configured Google redirect origin when explicit public origin absent',async()=>{vi.stubEnv('WORKPULSE_PUBLIC_ORIGIN','');const r=await personalStart(internal('/api/personal/google/start'));expect(r.status).toBe(307);});
});
