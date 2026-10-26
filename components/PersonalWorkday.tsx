"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { StepTouchChallenge, type StepTouchDetector } from './StepTouchChallenge';
import MovementScene from './MovementScene';
import RouteScene from './RouteScene';
import {PersonalDayTimeline,localTime} from './PersonalDayTimeline';
import type { Goal, PersonalState } from '@/lib/personal/types';
import {exercises,getExercise,type ExerciseId} from '@/lib/personal/exercises';
import './personal-workday.css';

export function PersonalWorkday({detectorFactory}:{detectorFactory?:()=>Promise<StepTouchDetector>}={}) {
  const [state,setState]=useState<PersonalState|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [now,setNow]=useState(()=>Date.now());
  const [visible,setVisible]=useState(true);
  const [goal,setGoal]=useState<Goal>('trail');
  const [exerciseId,setExerciseId]=useState<ExerciseId>('lantern-route');
  const [owned,setOwned]=useState<{id:string;lease:string}|null>(null);
  const sequence=useRef(0);
  const live=useRef(true);

  const load=useCallback(async(refresh=false)=>{
    const id=++sequence.current;
    try {
      const response=await fetch('/api/personal'+(refresh?'?refresh=1':''),{cache:'no-store',signal:AbortSignal.timeout(12_000)});
      const data=await response.json() as PersonalState;
      if(!response.ok)throw new Error(data.error??'Could not read your workday. Retry.');
      if(live.current&&id===sequence.current){setState(data);setNow(Date.now());setError('');const currentExercise=data.run&&data.run.status!=='complete'?getExercise(data.run.exerciseId):undefined;if(currentExercise)setExerciseId(currentExercise.id);}
      return data;
    }catch(e){if(live.current&&id===sequence.current){setError(e instanceof Error?e.message:'Connection unavailable. Retry.');setState(s=>s?{...s,decision:'unknown',availability:null,timeline:null,breakForecast:null,forecastReason:'unknown'}:s);}return null;}
  },[]);

  useEffect(()=>{
    live.current=true;
    const initial=window.setTimeout(()=>{const requested=getExercise(new URLSearchParams(window.location.search).get('exercise'));if(requested)setExerciseId(requested.id);setVisible(document.visibilityState==='visible');void load(true);},0);
    const clock=window.setInterval(()=>setNow(Date.now()),1_000);
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void load(true);},60_000);
    const visible=()=>{setVisible(document.visibilityState==='visible');setNow(Date.now());if(document.visibilityState==='visible')void load(true);};
    document.addEventListener('visibilitychange',visible);
    return()=>{live.current=false;clearTimeout(initial);clearInterval(timer);clearInterval(clock);document.removeEventListener('visibilitychange',visible);};
  },[load]);

  async function action(actionName:string,extra:Record<string,unknown>={}) {
    const id=++sequence.current;
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/personal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:actionName,...extra}),signal:AbortSignal.timeout(12_000)});
      const data=await response.json() as PersonalState;
      if(!response.ok)throw new Error(data.error??'Could not save this action. Retry.');
      if(live.current&&id===sequence.current){setState(data);setNow(Date.now());if((actionName==='start-run'||actionName==='start-exercise'||actionName==='resume-run')&&data.run&&data.runLease){setOwned({id:data.run.id,lease:data.runLease});}if(actionName==='disconnect'||actionName==='cancel-run')setOwned(null);}
      return data;
    }catch(e){if(live.current){setError(e instanceof Error?e.message:'Could not save this action. Retry.');setState(s=>s?{...s,decision:'unknown',availability:null,timeline:null,breakForecast:null,forecastReason:'unknown'}:s);}return null;}
    finally{if(live.current)setBusy(false);}
  }

  async function saveCycle(count:number) {
    if(!state?.run||!owned||owned.id!==state.run.id)return false;
    const id=owned.id;
    const saved=await action('progress',{runId:id,lease:owned.lease,count,...(state.run.exerciseId?{exerciseId:state.run.exerciseId}:{})});
    if(saved?.run?.id===id&&saved.run.count>=count)return true;
    // The server may have committed before a response was lost. Discover it,
    // never invent another count or award the same round twice.
    const recovered=await load();
    return Boolean(recovered?.run?.id===id&&recovered.run.count>=count);
  }

  const run=state?.run;
  const runExercise=getExercise(run?.exerciseId);
  const runTarget=runExercise?.target??8;
  const active=run&&run.status!=='complete'&&owned?.id===run.id;
  const fresh=(observedAt:number|undefined)=>observedAt!==undefined&&now-observedAt<=90_000&&observedAt<=now+5000;
  const availabilityFresh=fresh(state?.availability?.observedAt);
  const timeline=state?.timeline&&fresh(state.timeline.observedAt)&&state.decision!=='unknown'?state.timeline:null;
  // Project the same five-minute rule between provider refreshes. A gap that was
  // exactly five minutes long must stop inviting as soon as time advances.
  const workStarted=state?.workStartedAt!=null&&state?.dueAt!=null&&Number.isFinite(state.dueAt);
  const intervals=timeline?[...timeline.busy].sort((a,b)=>a.start-b.start):[];
  const busyNow=intervals.some(b=>b.start<=now&&b.end>now);
  const nextBusy=intervals.find(b=>b.start>now)?.start??timeline?.end??now;
  const freeMinutes=busyNow?0:Math.max(0,Math.floor((nextBusy-now)/60_000));
  let forecast:PersonalState['breakForecast']=null;
  let forecastReason:PersonalState['forecastReason']=timeline?'start-work':'unknown';
  if(timeline&&workStarted&&state){
    const earliest=Math.max(now,state.dueAt!),duration=5*60_000;let start=earliest;
    for(const interval of intervals){if(interval.end<=start)continue;if(interval.start>=start+duration)break;start=interval.end;}
    if(start+duration<=timeline.end){forecast={start,end:start+duration};forecastReason=start>earliest?'after-busy':start===now?'due-now':'after-due';}
    else forecastReason='no-window';
  }
  const canMove=Boolean(workStarted&&state&&state.dueAt!<=now&&timeline&&!busyNow&&nextBusy-now>=300_000&&timeline.end-now>=300_000);
  const decision=state&&(state.decision==='move'||state.decision==='wait')
    ? !availabilityFresh||!timeline||!workStarted?'unknown':canMove?'move':'wait':state?.decision;
  const forecastExplanation=forecastReason==='after-busy'?'The first eligible 5-minute window is after the busy calendar block.':forecastReason==='after-due'?'The first free 5-minute window starts after your 45-minute work interval.':forecastReason==='due-now'?'Your work interval is due and the selected calendars have at least 5 free minutes now.':forecastReason==='no-window'?'No free 5-minute window is available in the checked calendar horizon.':forecastReason==='start-work'?'Start a work session to establish when your 45-minute interval is due.':'Check calendar availability to find the next suitable break.';
  const decisionTitle=decision==='move'?'MOVE NOW':decision==='wait'?'WAIT':decision==='unknown'?'Availability unknown':decision==='start-work'?'Ready when you are':'Connect your calendars';

  return <main className="app-shell personal-workday">
    <SiteHeader current="personal"/>
    <header className="personal-heading"><h1>My day</h1><p>Your calendars, movement breaks and saved activity in one place.</p>{state?.connected&&<p><a href="#exercises">Choose an exercise</a> · <a href="#activity-history">View activity history</a></p>}</header>
    {error&&<div className="personal-error" role="alert"><p>{error}</p><button className="button button--quiet" disabled={busy} onClick={()=>void load(true)}>Retry connection</button></div>}
    {!state&&!error&&<p role="status">Checking your private workday…</p>}
    {state&&!state.connected&&<section className="personal-setup" aria-label="Calendar setup">
      <h2>Connect your calendars</h2>
      {state.configured?<><p>Choose calendars from one Google account. WorkPulse reads availability, not meeting titles, and cannot edit events. The calendar inspector uses separate temporary access; connect here to save access for your personal workday.</p><a className="button button--primary" href="/api/personal/google/start">Connect Google Calendar</a></>:<><p>Google connection is not configured yet. Complete the private Google setup before connecting your account.</p><a className="button button--quiet" href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noreferrer">Open Google setup</a></>}
      <p>You can try the camera challenge first. Practice does not use a calendar or record a completed workday break.</p><Link className="button button--quiet" href="/move">Try camera challenge</Link>
    </section>}
    {state?.connected&&<>
      {visible&&decision==='move'&&!active&&(!run||run.status==='complete')&&<div className="personal-invitation" data-testid="break-invitation" role="status" aria-live="polite"><strong>A free moment to move</strong><p>Your 45-minute work interval is due, and your calendars have at least five free minutes. Start the camera challenge when you are ready.</p></div>}
      <div className="personal-dashboard">
        <PersonalDayTimeline timeline={timeline} forecast={forecast} now={now}/>
        <div className="personal-assistant">
        <section className="personal-decision" aria-label="Current movement decision" data-decision={decision}>
          <h2 aria-live="polite">{decisionTitle}</h2>
          <p>{decision==='unknown'?'We need a fresh calendar check before suggesting a break.':timeline?forecastExplanation:state.availability?.reason??(decision==='start-work'?'Start a work session to begin your 45-minute interval. Calendar events do not tell us how long you have been sitting.':'We need a fresh calendar check before suggesting a break.')}</p>
          {forecast&&decision!=='unknown'&&<p className="personal-next-break">Nearest break window<br/><strong>{localTime(forecast.start)}–{localTime(forecast.end)}</strong><br/>5 minutes · free across your selected calendars</p>}
          <p className="personal-small">Recommendations use your work interval and calendar availability. They do not infer how long you have been sitting.</p>
          {state.dueAt&&<p>Next eligible moment: <strong>{localTime(state.dueAt)}</strong></p>}
          {availabilityFresh&&state.availability&&<p className="personal-small">Calendar checked {localTime(state.availability.observedAt)} · {state.availability.isBusy?'Busy now':`${freeMinutes} full free minutes ahead`}</p>}
          {decision==='start-work'&&<button className="button button--primary" disabled={busy||Boolean(run&&run.status!=='complete')} onClick={()=>void action('start-work')}>Start work session</button>}
          {decision==='move'&&!active&&(!run||run.status==='complete')&&<div className="personal-actions"><p>Selected exercise: {getExercise(exerciseId)?.name}</p><button className="button button--primary" disabled={busy} onClick={()=>void action('start-run',{goal,exerciseId})}>Start camera challenge</button><button className="button button--quiet" disabled={busy} onClick={()=>void action('snooze')}>Snooze 20 minutes</button><button className="button button--quiet" disabled={busy} onClick={()=>void action('skip')}>Skip for 45 minutes</button></div>}
          {(decision==='unknown'||decision==='wait')&&<button className="button button--quiet" disabled={busy} onClick={()=>void action('refresh')}>Check calendar now</button>}
          {state.warning&&<p role="status">{state.warning}</p>}
        </section>
        <aside className="personal-settings" aria-label="Workday settings">
          <details><summary>Scene theme</summary><fieldset disabled={busy||Boolean(active)}><legend>Choose the scene theme</legend>
            <label><input type="radio" name="personal-goal" checked={goal==='trail'} onChange={()=>setGoal('trail')}/>Summit lantern route</label>
            <label><input type="radio" name="personal-goal" checked={goal==='workshop'} onChange={()=>setGoal('workshop')}/>Workshop lantern route</label>
          </fieldset>
          <p>{exerciseId==='lantern-route'?'Six side steps → arms out to open the gate → arms up to light the lantern.':'The scene advances with the recognized movements of your selected exercise.'}</p></details>
          <details><summary>Selected Google calendars ({state.selected.length})</summary><p>At least one calendar must stay selected. Selection changes require a fresh availability check.</p><fieldset disabled={busy||Boolean(active)}><legend>Include in availability</legend>{state.calendars?.map(c=><label key={c.id}><input type="checkbox" checked={state.selected.includes(c.id)} disabled={state.selected.length===1&&state.selected.includes(c.id)||state.selected.length>=20&&!state.selected.includes(c.id)} onChange={()=>void action('select',{calendarIds:state.selected.includes(c.id)?state.selected.filter(id=>id!==c.id):[...state.selected,c.id]})}/>{c.name}</label>)}</fieldset></details>
          <button className="button button--quiet" disabled={busy||Boolean(active)} onClick={()=>void action('disconnect')}>Disconnect Google</button>
        </aside>
        </div>
      </div>
      <section className="personal-exercises" id="exercises" aria-labelledby="exercise-heading"><h2 id="exercise-heading">Exercises</h2><p>Choose a camera-guided break. You can start when you choose, without waiting for the next recommendation. Completed movements are saved to your activity history.</p>
        <fieldset disabled={busy||Boolean(run&&run.status!=='complete')}><legend>Choose your exercise</legend><div className="personal-exercise-options">{exercises.map(e=><label key={e.id}><input type="radio" name="exercise" data-testid={`exercise-${e.id}`} checked={exerciseId===e.id} onChange={()=>setExerciseId(e.id)}/><span><strong>{e.name}</strong><span>{e.target} camera-recognized movements</span><span>{e.id==='lantern-route'?'Six steps, open the gate, light the lantern.':e.id==='neck-reset'?'Turn left and right, look down and up; return to centre.':'Lift both shoulders, then relax them down.'}</span></span></label>)}</div></fieldset>
        {(!run||run.status==='complete')&&<><button className="button button--primary" disabled={busy} onClick={()=>void action('start-exercise',{exerciseId,goal})}>Start exercise now</button><p className="personal-small">This is your choice to move now{decision==='wait'&&busyNow?' while a selected calendar is busy':''}. Completion resets the next work interval to 45 minutes. Camera access begins only when you enable it.</p></>}
      </section>
      {run&&run.status!=='complete'&&!active&&<section className="personal-unfinished"><h2>Unfinished round · {run.count}/{runTarget} movements saved</h2><p>{runExercise?.name??'Earlier movement round'}. Resume recalibrates the camera. Only acknowledged movements are kept.{!run.movementVersion&&!run.exerciseId&&' This saved round uses the earlier eight-step exercise.'}</p><button className="button button--primary" disabled={busy} onClick={()=>void action('resume-run',{runId:run.id})}>Resume unfinished round</button></section>}
      {active&&run&&<StepTouchChallenge key={`${run.id}:${owned?.lease}`} goal={run.goal} initialCount={run.count} exerciseId={run.exerciseId} movementVersion={run.movementVersion??'steps-v1'} detectorFactory={detectorFactory} onCycle={saveCycle} onPause={()=>{void action('pause-run',{runId:run.id,lease:owned?.lease});setOwned(null);}} onCancel={()=>{void action('cancel-run',{runId:run.id,lease:owned?.lease});setOwned(null);}}/>}
      {run?.status==='complete'&&<><section className="personal-complete" role="status"><h2>Round complete · {runTarget}/{runTarget}</h2>{runExercise&&<p>{runExercise.name} saved to your activity history.</p>}<p>{run.movementVersion==='route-v1'?'You walked to the gate, opened it and lit the lantern.':runExercise?'Camera-recognized movements completed.':run.goal==='trail'?'You reached the summit.':'Your lantern is lit.'} Your next eligible break is 45 minutes after completion.</p><p className="personal-small">Camera-recognized movement pattern; this does not assess exercise form.</p></section>{run.movementVersion==='route-v1'?<RouteScene count={8} goal={run.goal}/>:<MovementScene scene={run.goal} completedCycles={runTarget} targetMovements={runTarget} status="complete"/>}</>}
      <section className="personal-history" id="activity-history" aria-labelledby="activity-history-heading"><h2 id="activity-history-heading">Activity history</h2><p>Saved personal sessions. Demo and self-reported entries are kept separately.</p>{state.history.length?<ol>{[...state.history].reverse().map(h=><li key={h.id} data-testid="saved-activity"><strong>{getExercise(h.exerciseId)?.name??(h.movementVersion==='route-v1'?'Gate opened · lantern lit':h.goal==='trail'?'Summit reached':'Lantern lit')}</strong><span>{h.exerciseId?`${h.steps} camera-recognized movements`:`${h.steps} camera-counted ${h.movementVersion==='route-v1'?'movements':'steps'}`} · {new Date(h.completedAt).toLocaleString()}{h.elapsedSeconds!==undefined&&<> · {h.elapsedSeconds} sec elapsed (including pauses)</>}{h.source&&<> · {h.source==='chosen'?'Started by you':'Suggested break'}</>}</span></li>)}</ol>:<p>No completed camera rounds yet. A paused or cancelled run does not count.</p>}</section>
      <p className="personal-small">Availability is checked while this page is visible. Keeping the browser closed does not run reminders. Camera permission is requested only when you enable it.</p>
    </>}
    <SiteFooter/>
  </main>;
}
