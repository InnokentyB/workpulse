import type { BusyInterval, ForecastState, PersonalRecord } from './types';
const MINUTE=60000;

/** Provider metadata is discarded before persisting or exposing this union. */
export function mergeBusy(periods:readonly BusyInterval[],start:number,end:number):BusyInterval[]{
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||!Array.isArray(periods))throw new Error('Invalid timeline bounds.');
 const sorted=periods.map(p=>{
  if(!p||!Number.isFinite(p.start)||!Number.isFinite(p.end)||p.end<=p.start)throw new Error('Invalid busy interval.');
  return {start:Math.max(start,p.start),end:Math.min(end,p.end)};
 }).filter(p=>p.end>p.start).sort((a,b)=>a.start-b.start);
 const merged:BusyInterval[]=[];
 for(const p of sorted){const previous=merged.at(-1);if(previous&&p.start<=previous.end)previous.end=Math.max(previous.end,p.end);else merged.push(p);}
 return merged;
}

/** Only complete, recent availability for the current selection can predict a break. */
export function forecast(record:PersonalRecord,now=Date.now()):ForecastState{
 const unknown:ForecastState={timeline:null,breakForecast:null,forecastReason:'unknown'},a=record.availability;
 if(!record.selected.length||!a||a.selectionVersion!==record.selectionVersion||!Number.isFinite(a.observedAt)||a.observedAt>now||now-a.observedAt>90000||typeof a.horizonStart!=='number'||!Number.isFinite(a.horizonStart)||a.horizonStart>now||!Number.isFinite(a.horizonEnd)||a.horizonEnd<now+5*MINUTE||!Array.isArray(a.busy))return unknown;
 let busy:BusyInterval[];try{busy=mergeBusy(a.busy,now,a.horizonEnd);}catch{return unknown;}
 const timeline={start:now,end:a.horizonEnd,busy,observedAt:a.observedAt};
 if(record.workStartedAt===null||record.dueAt===null)return {timeline,breakForecast:null,forecastReason:'start-work'};
 if(!Number.isFinite(record.dueAt))return unknown;
 const earliest=Math.max(now,record.dueAt);let start=earliest;
 for(const p of busy){if(p.end<=start)continue;if(p.start>=start+5*MINUTE)break;start=p.end;}
 if(start+5*MINUTE>a.horizonEnd)return {timeline,breakForecast:null,forecastReason:'no-window'};
 return {timeline,breakForecast:{start,end:start+5*MINUTE},forecastReason:start>earliest?'after-busy':start===now?'due-now':'after-due'};
}
