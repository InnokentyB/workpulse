'use client';

export type DayInterval={start:number;end:number};
export type DayTimeline={start:number;end:number;busy:DayInterval[];observedAt:number};
export function localTime(time:number){return new Date(time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});}
function mergedBusy(t:DayTimeline):DayInterval[]{
 const sorted=t.busy.filter(b=>Number.isFinite(b.start)&&Number.isFinite(b.end)&&b.end>b.start).map(b=>({start:Math.max(t.start,b.start),end:Math.min(t.end,b.end)})).filter(b=>b.end>b.start).sort((a,b)=>a.start-b.start);
 const result:DayInterval[]=[];for(const b of sorted){const last=result.at(-1);if(last&&b.start<=last.end)last.end=Math.max(last.end,b.end);else result.push({...b});}return result;
}
export function PersonalDayTimeline({timeline,forecast,now}:{timeline:DayTimeline|null;forecast:DayInterval|null;now:number}){
 const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 if(!timeline||!Number.isFinite(timeline.start)||!Number.isFinite(timeline.end)||timeline.end<=timeline.start)return <section className="personal-timeline" aria-label="Calendar day"><h2>Calendar day</h2><p>Fresh calendar availability is needed to show your day. No sample appointments are displayed.</p><p className="personal-small">Time zone: {timezone}</p></section>;
 const busy=mergedBusy(timeline),agenda:Array<DayInterval&{kind:'busy'|'free'}>=[];
 let cursor=timeline.start;for(const b of busy){if(b.start>cursor)agenda.push({start:cursor,end:b.start,kind:'free'});agenda.push({...b,kind:'busy'});cursor=b.end;}if(cursor<timeline.end)agenda.push({start:cursor,end:timeline.end,kind:'free'});
 const pct=(value:number)=>(value-timeline.start)/(timeline.end-timeline.start)*100;
 const hours:number[]=[];const tick=new Date(timeline.start);tick.setMinutes(0,0,0);if(tick.getTime()<timeline.start)tick.setHours(tick.getHours()+1);while(tick.getTime()<timeline.end){hours.push(tick.getTime());tick.setHours(tick.getHours()+1);}
 const validForecast=forecast&&forecast.start>=timeline.start&&forecast.end<=timeline.end&&forecast.end>forecast.start&&!busy.some(b=>b.start<forecast.end&&b.end>forecast.start)?forecast:null;
 return <section className="personal-timeline" aria-label="Calendar day">
  <header><div><h2>Calendar day</h2><p>{new Date(timeline.start).toLocaleDateString([],{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div><span className="personal-small">Next 8 hours</span></header>
  <p className="personal-small">Time zone: {timezone} · {localTime(timeline.start)}–{localTime(timeline.end)}{new Date(timeline.start).toDateString()!==new Date(timeline.end).toDateString()?` (ends ${new Date(timeline.end).toLocaleDateString()})`:''}</p>
  <ul className="day-legend" aria-label="Calendar legend"><li><i className="day-legend__free"/>Free</li><li><i className="day-legend__busy"/>Busy</li><li><i className="day-legend__break"/>5-minute break</li></ul>
  {validForecast&&<p className="day-recommended">Recommended break: <strong>{localTime(validForecast.start)}–{localTime(validForecast.end)}</strong> · 5 minutes</p>}
  <div className="day-grid" data-testid="calendar-grid" aria-hidden="true">
   <div className="day-grid__free"/>
   {hours.map(h=><div className="day-grid__hour" key={h} style={{top:`${pct(h)}%`}}><time>{localTime(h)}</time><span/></div>)}
   {busy.map((b,i)=><div key={i} className="day-grid__busy" title={`Busy · ${localTime(b.start)}–${localTime(b.end)}`} style={{top:`${pct(b.start)}%`,height:`${pct(b.end)-pct(b.start)}%`}}>{b.end-b.start>=30*60000&&<span>Busy · {localTime(b.start)}–{localTime(b.end)}</span>}</div>)}
   {validForecast&&<div className="day-grid__break" title={`5-minute break · ${localTime(validForecast.start)}–${localTime(validForecast.end)}`} style={{top:`${pct(validForecast.start)}%`,height:`${pct(validForecast.end)-pct(validForecast.start)}%`}}/>}
   {now>=timeline.start&&now<timeline.end&&<div className="day-grid__now" style={{top:`${pct(now)}%`}}><span>Now</span><i/></div>}
  </div>
  <details className="day-agenda" open><summary>Availability agenda</summary><ol aria-label="Calendar agenda">{agenda.map((a,i)=><li key={i} data-kind={a.kind}><time>{localTime(a.start)}–{localTime(a.end)}</time><strong>{a.kind==='busy'?'Busy':'Free'}</strong></li>)}</ol></details>
  <p className="personal-small">Busy periods combine all selected calendars. Meeting names and details are not requested. Checked {localTime(timeline.observedAt)}.</p>
 </section>;
}
