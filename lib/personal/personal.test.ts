// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chmod, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/personal/route';
import { personalConfig, readRecord, saveRecord } from './store';
let dir:string, cookie:string;
const req=(body:unknown,origin='http://localhost:3000')=>new NextRequest('http://localhost:3000/api/personal',{method:'POST',headers:{origin,'content-type':'application/json',cookie},body:JSON.stringify(body)});
async function post(body:unknown){const r=await POST(req(body));return {status:r.status,data:await r.json()};}
beforeEach(async()=>{dir=await mkdtemp(join(tmpdir(),'personal-test-'));vi.stubEnv('WORKPULSE_PERSONAL_TEST','1');vi.stubEnv('WORKPULSE_PERSONAL_DATA_DIR',dir);vi.stubEnv('WORKPULSE_PERSONAL_TEST_SECRET','test-secret-'.repeat(6));vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','');vi.stubEnv('GOOGLE_CALENDAR_CLIENT_SECRET','');cookie='';const r=await POST(req({action:'__fixture',scenario:'due'}));cookie=r.headers.get('set-cookie')?.split(';')[0]??'';});
afterEach(async()=>{vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true});});
describe('personal workday boundary',()=>{
 it('exposes due live state without tokens or leases',async()=>{const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}));const s=await r.json();expect(s.connected).toBe(true);expect(s.decision).toBe('move');expect(JSON.stringify(s)).not.toMatch(/fixture-access|refreshToken|accessToken|lease/);});
 it('guards origin and connection cookie',async()=>{expect((await POST(req({action:'start-work'},'https://evil.test'))).status).toBe(403);cookie='workpulse_personal=not-valid';expect((await post({action:'start-work'})).status).toBe(401);});
 it('starts work with 45 minute interval and snoozes without completion',async()=>{const s=await post({action:'start-work'});expect(s.data.dueAt-s.data.workStartedAt).toBe(45*60000);expect(s.data.decision).toBe('wait');const z=await post({action:'snooze'});expect(z.data.history).toEqual([]);expect(z.data.dueAt).toBeGreaterThan(Date.now()+19*60000);});
 it('validates selection and invalidates the snapshot',async()=>{expect((await post({action:'select',calendarIds:[]})).status).toBe(400);expect((await post({action:'select',calendarIds:['unknown']})).status).toBe(400);const s=await post({action:'select',calendarIds:['primary']});expect(s.data.availability).toBeNull();expect(s.data.decision).toBe('unknown');});
 it('rejects concurrent run, stale lease and arbitrary completion',async()=>{const a=await post({action:'start-run',goal:'trail'});expect(a.status).toBe(200);expect((await post({action:'start-run',goal:'workshop'})).status).toBe(409);expect((await post({action:'progress',runId:a.data.run.id,lease:'bad',count:1})).status).toBe(409);expect((await post({action:'complete'})).status).toBe(400);});
 it('counts acknowledged steps and atomically completes exactly once',async()=>{const a=await post({action:'start-run',goal:'trail'});const b={action:'progress',runId:a.data.run.id,lease:a.data.runLease};expect((await post({...b,count:2})).status).toBe(409);for(let count=1;count<=8;count++){const r=await post({...b,count});expect(r.status).toBe(200);}const retry=await post({...b,count:8});expect(retry.status).toBe(200);expect(retry.data.history).toHaveLength(1);expect(retry.data.run.status).toBe('complete');expect(retry.data.dueAt-retry.data.lastCompletedAt).toBe(45*60000);});
 it('rotates run lease on resume and keeps persisted count',async()=>{const a=await post({action:'start-run',goal:'workshop'});const b={runId:a.data.run.id,lease:a.data.runLease};await post({action:'progress',...b,count:1});await post({action:'pause-run',...b});const resumed=await post({action:'resume-run',runId:b.runId});expect(resumed.data.run.count).toBe(1);expect(resumed.data.runLease).not.toBe(b.lease);expect((await post({action:'progress',...b,count:2})).status).toBe(409);});
 it('does not start if any selected calendar is busy or unavailable',async()=>{for(const scenario of ['busy','unavailable']){const r=await POST(req({action:'__fixture',scenario}));cookie=r.headers.get('set-cookie')!.split(';')[0];const s=await post({action:'start-run',goal:'trail'});expect([409,502]).toContain(s.status);}});
 it('persists encrypted data and rejects corrupt stores',async()=>{const names=await readdir(dir);const p=join(dir,names[0]);const raw=await readFile(p,'utf8');expect(raw).not.toContain('fixture-refresh');const {writeFile}=await import('node:fs/promises');await writeFile(p,'broken');expect((await post({action:'start-work'})).status).toBe(503);});
 it('disconnect removes local connection even when revoked provider unavailable',async()=>{expect((await post({action:'disconnect'})).status).toBe(200);expect((await post({action:'start-work'})).status).toBe(401);});
 it('serializes concurrent duplicate progress without double counting',async()=>{const a=await post({action:'start-run',goal:'trail'});const b={action:'progress',runId:a.data.run.id,lease:a.data.runLease,count:1};const both=await Promise.all([post(b),post(b)]);expect(both.map(r=>r.status)).toEqual([200,200]);expect(both.map(r=>r.data.run.count)).toEqual([1,1]);});
 it('fails closed when stale calendar refresh becomes unavailable',async()=>{const id=cookie.split('=')[1],c=personalConfig()!,record=(await readRecord(id,c))!;record.availability!.observedAt=Date.now()-91000;record.fixture='unavailable';await saveRecord(id,record,c);expect((await post({action:'start-run',goal:'trail'})).status).toBe(502);const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}));expect((await r.json()).decision).toBe('unknown');});
 it('never acknowledges a step that failed durable storage',async()=>{const a=await post({action:'start-run',goal:'trail'});await chmod(dir,0o500);try{const r=await post({action:'progress',runId:a.data.run.id,lease:a.data.runLease,count:1});expect(r.status).toBe(503);}finally{await chmod(dir,0o700);}const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}));expect((await r.json()).run.count).toBe(0);});
 it('refuses fixture mode combined with live credentials',async()=>{vi.stubEnv('GOOGLE_CALENDAR_CLIENT_ID','live');expect((await POST(req({action:'__fixture',scenario:'due'}))).status).toBe(503);});
});

describe('movement route version compatibility',()=>{
 it('persists and exposes route-v1 on new runs and completed history',async()=>{
  const a=await post({action:'start-run',goal:'trail'});
  expect(a.data.run.movementVersion).toBe('route-v1');
  const c=personalConfig()!,record=(await readRecord(cookie.split('=')[1],c))!;
  expect(record.run?.movementVersion).toBe('route-v1');
  for(let count=1;count<=8;count++)await post({action:'progress',runId:a.data.run.id,lease:a.data.runLease,count});
  const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}})),s=await r.json();
  expect(s.run.movementVersion).toBe('route-v1');expect(s.history[0].movementVersion).toBe('route-v1');
 });
 it('keeps an unversioned persisted run and history legacy through resume and completion',async()=>{
  const a=await post({action:'start-run',goal:'workshop'}),c=personalConfig()!,id=cookie.split('=')[1],record=(await readRecord(id,c))!;
  delete record.run!.movementVersion;
  record.history=[{id:'older',goal:'trail',steps:8,completedAt:Date.now()-60000}];
  await saveRecord(id,record,c);
  const resumed=await post({action:'resume-run',runId:a.data.run.id});
  expect(resumed.data.run).not.toHaveProperty('movementVersion');
  for(let count=1;count<=8;count++)await post({action:'progress',runId:a.data.run.id,lease:resumed.data.runLease,count});
  const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}})),s=await r.json();
  expect(s.run).not.toHaveProperty('movementVersion');expect(s.history).toHaveLength(2);
  for(const entry of s.history)expect(entry).not.toHaveProperty('movementVersion');
 });
});

describe('chosen catalogue exercises',()=>{
 it('starts a chosen exercise before the break is due, while scheduled remains blocked',async()=>{
  await post({action:'start-work'});expect((await post({action:'start-run',goal:'trail'})).status).toBe(409);
  const a=await post({action:'start-exercise',exerciseId:'neck-reset',target:999});expect(a.status).toBe(200);expect(a.data.run).toMatchObject({exerciseId:'neck-reset',source:'chosen',target:4,goal:'trail',count:0});
 });
 it('starts and resumes chosen exercises with busy or unknown calendars and no work session',async()=>{
  for(const scenario of ['busy','unavailable']){
   const fixture=await POST(req({action:'__fixture',scenario}));cookie=fixture.headers.get('set-cookie')!.split(';')[0];
   const c=personalConfig()!,id=cookie.split('=')[1],record=(await readRecord(id,c))!;record.workStartedAt=null;record.dueAt=null;await saveRecord(id,record,c);
   const a=await post({action:'start-exercise',exerciseId:'shoulder-rolls'});expect(a.status).toBe(200);
   await post({action:'pause-run',runId:a.data.run.id,lease:a.data.runLease});const b=await post({action:'resume-run',runId:a.data.run.id});expect(b.status).toBe(200);expect(b.data.runLease).not.toBe(a.data.runLease);expect(b.data.workStartedAt).toBeNull();expect((await post({action:'progress',runId:a.data.run.id,lease:a.data.runLease,count:1})).status).toBe(409);
  }
 });
 it('starts a 45 minute session only after chosen completion and measures elapsed wall time',async()=>{
  const c=personalConfig()!,id=cookie.split('=')[1],record=(await readRecord(id,c))!;record.workStartedAt=null;record.dueAt=null;await saveRecord(id,record,c);
  const a=await post({action:'start-exercise',exerciseId:'neck-reset'});expect(a.data.workStartedAt).toBeNull();
  const active=(await readRecord(id,c))!;active.run!.startedAt=Date.now()-120000;await saveRecord(id,active,c);
  let completed;for(let count=1;count<=4;count++)completed=await post({action:'progress',runId:a.data.run.id,lease:a.data.runLease,exerciseId:'neck-reset',count});
  expect(completed!.data.workStartedAt).toBe(completed!.data.lastCompletedAt);expect(completed!.data.dueAt-completed!.data.workStartedAt).toBe(45*60000);expect(completed!.data.history[0].elapsedSeconds).toBeGreaterThanOrEqual(120);
 });
 it.each([['neck-reset',4],['shoulder-rolls',6],['lantern-route',8]] as const)('persists exact target and one rich completion for %s',async(exerciseId,target)=>{
  const a=await post({action:'start-exercise',exerciseId});expect(a.status).toBe(200);const p={action:'progress',runId:a.data.run.id,lease:a.data.runLease,exerciseId};
  expect((await post({...p,count:target+1})).status).toBe(400);
  for(let count=1;count<=target;count++)expect((await post({...p,count})).status).toBe(200);
  const duplicate=await post({...p,count:target});expect(duplicate.data.history).toHaveLength(1);expect(duplicate.data.history[0]).toMatchObject({exerciseId,source:'chosen',steps:target});expect(duplicate.data.history[0].elapsedSeconds).toBeGreaterThanOrEqual(0);
  const r=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}})),s=await r.json();expect(s.history).toEqual(duplicate.data.history);expect(s.run.status).toBe('complete');expect(s.dueAt-s.lastCompletedAt).toBe(45*60000);
 });
 it('rejects unknown IDs and concurrent runs, and preserves scheduled route semantics',async()=>{
  expect((await post({action:'start-exercise',exerciseId:'invented'})).status).toBe(400);
  const a=await post({action:'start-run',goal:'trail'});expect(a.data.run).toMatchObject({exerciseId:'lantern-route',source:'scheduled',target:8});expect((await post({action:'start-exercise',exerciseId:'neck-reset'})).status).toBe(409);
 });
 it('accepts a catalogue exercise for a scheduled break and rejects unknown IDs',async()=>{
  expect((await post({action:'start-run',goal:'trail',exerciseId:'invented'})).status).toBe(400);
  const a=await post({action:'start-run',goal:'trail',exerciseId:'neck-reset'});expect(a.status).toBe(200);expect(a.data.run).toMatchObject({exerciseId:'neck-reset',source:'scheduled',target:4});
 });
 it('completes an existing unannotated legacy run at eight without inventing exercise metadata',async()=>{
  const a=await post({action:'start-run',goal:'trail'}),c=personalConfig()!,id=cookie.split('=')[1],r=(await readRecord(id,c))!;
  delete r.run!.exerciseId;delete r.run!.source;delete r.run!.target;delete r.run!.startedAt;delete r.run!.movementVersion;await saveRecord(id,r,c);
  for(let count=1;count<=8;count++)await post({action:'progress',runId:a.data.run.id,lease:a.data.runLease,count});
  const s=await (await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}))).json();expect(s.history[0].steps).toBe(8);expect(s.history[0]).not.toHaveProperty('exerciseId');expect(s.history[0]).not.toHaveProperty('elapsedSeconds');
 });
});

describe('typed exercise storage rollback guard',()=>{
 it.each(['start-run','start-exercise'])('marks %s records v2 while current reader remains compatible',async action=>{
  const id=cookie.split('=')[1],c=personalConfig()!;expect((await readRecord(id,c))!.version).toBe(1);
  expect((await post({action,exerciseId:'neck-reset',goal:'trail'})).status).toBe(200);
  expect((await readRecord(id,c))!.version).toBe(2);
  const response=await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}));expect(response.status).toBe(200);expect((await response.json()).run.target).toBe(4);
 });
 it('preserves v1 while resuming an existing legacy run',async()=>{
  const a=await post({action:'start-run',goal:'trail'}),c=personalConfig()!,id=cookie.split('=')[1],r=(await readRecord(id,c))!;
  r.version=1;delete r.run!.exerciseId;delete r.run!.source;delete r.run!.target;delete r.run!.startedAt;await saveRecord(id,r,c);
  expect((await post({action:'resume-run',runId:a.data.run.id})).status).toBe(200);expect((await readRecord(id,c))!.version).toBe(1);
 });
});


describe('older browser movement identity guard',()=>{
 it.each(['neck-reset','shoulder-rolls'])('requires matching movement identity for %s progress',async exerciseId=>{
  const a=await post({action:'start-exercise',exerciseId}),p={action:'progress',runId:a.data.run.id,lease:a.data.runLease,count:1};
  expect((await post(p)).status).toBe(409);expect((await post({...p,exerciseId:'lantern-route'})).status).toBe(409);
  const s=await (await GET(new NextRequest('http://localhost:3000/api/personal',{headers:{cookie}}))).json();expect(s.run.count).toBe(0);expect(s.history).toEqual([]);
  expect((await post({...p,exerciseId})).status).toBe(200);
 });
});
