// @vitest-environment node
import { describe, expect, it, vi, afterEach } from 'vitest';
import { forecast, mergeBusy } from './forecast';
import { newRecord, refresh, state } from './service';
import type { PersonalRecord } from './types';
const M=60000,N=1800000000000;
function record():PersonalRecord {const r=newRecord('access','refresh',N+3600000);r.selected=['primary','second'];r.workStartedAt=N-45*M;r.dueAt=N;r.availability={observedAt:N,horizonStart:N,horizonEnd:N+480*M,selectionVersion:0,isBusy:false,freeMinutes:480,reason:'Free',busy:[]};return r;}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('private busy/free forecast',()=>{
 it('merges overlapping and adjacent intervals, clamps horizon and never carries provider metadata',()=>{
  expect(mergeBusy([{start:N-10*M,end:N+10*M},{start:N+5*M,end:N+20*M},{start:N+20*M,end:N+25*M},{start:N+490*M,end:N+500*M}],N,N+480*M)).toEqual([{start:N,end:N+25*M}]);
 });
 it('finds earliest full five minutes at due time or after a conflicting union',()=>{
  const r=record();r.dueAt=N+45*M;r.availability!.busy=[{start:N+44*M,end:N+60*M},{start:N+64*M,end:N+70*M}];
  expect(forecast(r,N)).toMatchObject({breakForecast:{start:N+70*M,end:N+75*M},forecastReason:'after-busy'});
  r.availability!.busy=[];expect(forecast(r,N)).toMatchObject({breakForecast:{start:N+45*M,end:N+50*M},forecastReason:'after-due'});
 });
 it('allows exact five minute gaps and rejects shorter or beyond-horizon suggestions',()=>{
  const r=record();r.availability!.busy=[{start:N+5*M,end:N+480*M}];expect(forecast(r,N).breakForecast).toEqual({start:N,end:N+5*M});
  r.availability!.busy=[{start:N+5*M-1,end:N+480*M}];expect(forecast(r,N)).toMatchObject({breakForecast:null,forecastReason:'no-window'});
  r.availability!.busy=[];r.dueAt=N+476*M;expect(forecast(r,N).breakForecast).toBeNull();
 });
 it('recomputes from now when a previously busy interval has ended',()=>{
  const r=record();r.availability!.busy=[{start:N,end:N+M}];expect(forecast(r,N+M+1).breakForecast).toEqual({start:N+M+1,end:N+6*M+1});
 });
 it('fails closed for legacy, stale, future, changed selection, malformed or missing snapshots',()=>{
  for(const change of [(r:PersonalRecord)=>{delete r.availability!.busy;},(r:PersonalRecord)=>{delete r.availability!.horizonStart;},(r:PersonalRecord)=>{r.availability!.observedAt=N-90001;},(r:PersonalRecord)=>{r.availability!.observedAt=N+1;},(r:PersonalRecord)=>{r.selectionVersion++;},(r:PersonalRecord)=>{r.availability=null;},(r:PersonalRecord)=>{r.availability!.busy=[{start:N+M,end:N}];}]){const r=record();change(r);expect(forecast(r,N)).toMatchObject({timeline:null,breakForecast:null,forecastReason:'unknown'});}
 });
 it('shows timeline before work starts but does not predict a break or infer sitting',()=>{
  const r=record();r.workStartedAt=null;r.dueAt=null;expect(forecast(r,N)).toMatchObject({timeline:{start:N,end:N+480*M,busy:[]},breakForecast:null,forecastReason:'start-work'});
 });
 it('unions all selected provider calendars and discards calendar metadata',async()=>{
  vi.useFakeTimers();vi.setSystemTime(N);const r=record();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({calendars:{primary:{busy:[{start:new Date(N).toISOString(),end:new Date(N+10*M).toISOString()}]},second:{busy:[{start:new Date(N+5*M).toISOString(),end:new Date(N+20*M).toISOString()}]}}}),{status:200})));
  await refresh(r,{test:false} as Parameters<typeof refresh>[1]);
  expect(r.availability!.busy).toEqual([{start:N,end:N+20*M}]);expect(state(r).breakForecast).toEqual({start:N+20*M,end:N+25*M});
 });
 it('rejects a partial provider response and clears the previous forecast',async()=>{
  vi.useFakeTimers();vi.setSystemTime(N);const r=record();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({calendars:{primary:{busy:[]},second:{errors:[{reason:'notFound'}]}}}),{status:200})));
  await expect(refresh(r,{test:false} as Parameters<typeof refresh>[1])).rejects.toThrow();expect(forecast(r,N)).toMatchObject({timeline:null,breakForecast:null,forecastReason:'unknown'});
 });
 it('refresh stores only a merged union and state exposes no calendar identifiers in timeline',async()=>{
  vi.useFakeTimers();vi.setSystemTime(N);const r=record();await refresh(r,{test:true} as Parameters<typeof refresh>[1]);const s=state(r);expect(s.timeline).toEqual({start:N,end:N+480*M,observedAt:N,busy:[]});expect(s.breakForecast).toEqual({start:N,end:N+5*M});expect(JSON.stringify(s.timeline)).not.toMatch(/primary|second|title|summary/);
 });
});
