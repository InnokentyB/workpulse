export default function RouteScene({count,goal}:{count:number;goal:'trail'|'workshop'}){
 const x=45+Math.min(count,6)*40;
 return <section className="route-scene" aria-label="Route progress" data-testid="route-scene">
  <svg viewBox="0 0 400 150" role="img" aria-label={`${count<6?'Walking to the gate':count===6?'At the closed gate':count===7?'Gate open, lantern waiting':'Gate open and lantern lit'}`}>
   <path d="M25 125H380" stroke="currentColor" strokeWidth="3" opacity=".25"/>
   {[0,1,2,3,4,5,6].map(n=><circle key={n} cx={45+n*40} cy="125" r="4" fill="currentColor"/>)}
   <g className={count>=7?'route-gate route-gate--open':'route-gate'} stroke="currentColor" fill="none" strokeWidth="5"><path d="M300 123V45H342V123"/><path className="route-gate__door" d="M304 49H338V120H304Z M315 50V120 M327 50V120"/></g>
   <g transform={`translate(${count>=7?350:x} 82)`} stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"><circle cy="-25" r="8"/><path d="M0-15V12M0-8L-12 2M0-8L12 2M0 12L-8 36M0 12L8 36"/></g>
   <g className={count===8?'route-lantern route-lantern--lit':'route-lantern'}><circle cx="370" cy="30" r="23" fill={count===8?'#e9b94e':'transparent'} opacity=".45"/><path d="M362 23H378V42H362Z M365 23V17H375V23" fill={count===8?'#f5c858':'none'} stroke="currentColor" strokeWidth="3"/></g>
  </svg>
  <p>{count<6?`${6-count} walking steps to the gate`:count===6?'Gate reached · open your arms sideways':count===7?'Gate opened · raise your arms to light the lantern':`${goal==='trail'?'Summit route':'Workshop route'} complete · lantern lit`}</p>
 </section>;
}
