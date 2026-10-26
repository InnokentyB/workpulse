"use client";
import { useState } from "react";
import Link from "next/link";
import { StepTouchChallenge } from "@/components/StepTouchChallenge";

export default function MovePracticePage() {
  const [goal,setGoal]=useState<"trail"|"workshop">("trail");
  const [run,setRun]=useState(0);
  return <main className="app-shell move-practice"><header><Link className="brand" href="/personal">WorkPulse · personal use</Link><h1>Raise your arms. Light the lantern.</h1><p>Arms sideways, lower; arms overhead, lower. Repeat twice. No steps or visible legs needed. Follow the current movement shown below.</p><p>Camera practice — calendar not connected. This page does not save a personal-workday completion.</p></header>
    <fieldset className="move-practice__goals"><legend>Choose your goal</legend><label><input type="radio" name="goal" checked={goal==="trail"} onChange={()=>{setGoal("trail");setRun(v=>v+1);}}/>Reach the summit</label><label><input type="radio" name="goal" checked={goal==="workshop"} onChange={()=>{setGoal("workshop");setRun(v=>v+1);}}/>Light the lantern</label></fieldset>
    <StepTouchChallenge exerciseId="lantern-arms" key={`${goal}-${run}`} goal={goal} onCycle={async()=>true}/>
    <button type="button" className="button button--quiet" onClick={()=>setRun(v=>v+1)}>New practice round</button><p><Link href="/personal">Connect your calendars for a personal workday</Link></p>
  </main>;
}
