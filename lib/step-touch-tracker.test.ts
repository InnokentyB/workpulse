import { describe, expect, it } from "vitest";
import { initialStepTouchState, updateStepTouch, type StepTouchState } from "./step-touch-tracker";

function pose(shift = 0, wide = false) {
  const p = Array.from({ length: 33 }, () => ({ x: .5, y: .5, visibility: 1 }));
  p[0] = { x: .5 + shift, y: .1, visibility: 1 };
  p[11] = { x: .35 + shift, y: .25, visibility: 1 }; p[12] = { x: .65 + shift, y: .25, visibility: 1 };
  p[23] = { x: .43 + shift, y: .5, visibility: 1 }; p[24] = { x: .57 + shift, y: .5, visibility: 1 };
  p[25] = { x: .45 + shift, y: .7, visibility: 1 }; p[26] = { x: .55 + shift, y: .7, visibility: 1 };
  p[27] = { x: (wide ? .32 : .47) + shift, y: .9, visibility: 1 }; p[28] = { x: (wide ? .68 : .53) + shift, y: .9, visibility: 1 };
  return p;
}
function calibrated(count = 0) { let s = initialStepTouchState(count); for (let i=0;i<15;i++) s=updateStepTouch(s,pose(),i*100); return s; }
function cycle(s: StepTouchState, side = s.expectedSide, start = s.lastTimestamp + 100) {
  const shift=side === "left" ? -.08 : .08;
  for (let i=0;i<8;i++) s=updateStepTouch(s,pose(shift,true),start+i*100);
  for (let i=0;i<3;i++) s=updateStepTouch(s,pose(),start+800+i*100);
  return s;
}
describe("side-step motion recognition",()=>{
  it("calibrates visible neutral body before accepting steps",()=>{ const s=calibrated(); expect(s.phase).toBe("step");expect(s.count).toBe(0); });
  it("counts alternating full side-out and return patterns through eight",()=>{let s=calibrated();for(let i=0;i<8;i++)s=cycle(s);expect(s.count).toBe(8);expect(s.phase).toBe("complete");});
  it("never counts stationary posture, arm-only changes or timer passage",()=>{let s=calibrated();for(let i=0;i<100;i++){const p=pose();p[15].x=.1+i%2*.7;s=updateStepTouch(s,p,2000+i*200);}expect(s.count).toBe(0);});
  it("requires hip movement as well as foot opening",()=>{let s=calibrated();for(let i=0;i<4;i++)s=updateStepTouch(s,pose(0,true),2000+i*100);for(let i=0;i<4;i++)s=updateStepTouch(s,pose(),3000+i*100);expect(s.count).toBe(0);});
  it("rejects a wrong side and repeated same side",()=>{let s=cycle(calibrated());expect(s.count).toBe(1);s=cycle(s,"left");expect(s.count).toBe(1);s=cycle(s,"right");expect(s.count).toBe(2);});
  it("does not count a partial opening or unseen return",()=>{let s=calibrated();s=updateStepTouch(s,pose(-.08,true),2000);s=updateStepTouch(s,pose(),3000);expect(s.count).toBe(0);s=updateStepTouch(s,[],4000);expect(s.phase).toBe("calibrating");expect(s.tracking).toBe("lost");});
  it("loss of framing preserves completed count but forces recalibration",()=>{let s=cycle(calibrated());s=updateStepTouch(s,[],4000);expect(s.count).toBe(1);expect(s.phase).toBe("calibrating");for(let i=0;i<15;i++)s=updateStepTouch(s,pose(),4100+i*100);expect(s.expectedSide).toBe("right");expect(s.phase).toBe("step");});
  it("requires visible feet and rejects invalid timestamps",()=>{let s=calibrated();const p=pose(-.08,true);p[27].visibility=.1;s=updateStepTouch(s,p,2000);expect(s.tracking).toBe("lost");expect(s.count).toBe(0);expect(updateStepTouch(s,pose(),Number.NaN).count).toBe(0);});
  it("a completed run cannot score again",()=>{let s=calibrated(7);s=cycle(s,"right");expect(s.count).toBe(8);s=cycle(s,"left",5000);expect(s.count).toBe(8);});
  it("does not average a moving/open posture into calibration",()=>{let s=initialStepTouchState();for(let i=0;i<30;i++)s=updateStepTouch(s,pose(i%2?.08:0,true),i*100);expect(s.phase).toBe("calibrating");expect(s.count).toBe(0);});
  it("does not join opening and return across a stalled sample gap",()=>{let s=cycle(calibrated());const count=s.count;let t=s.lastTimestamp;for(let i=0;i<3;i++)s=updateStepTouch(s,pose(.08,true),t+=100);expect(s.phase).toBe("return");s=updateStepTouch(s,pose(),t+=751);expect(s.phase).toBe("calibrating");expect(s.count).toBe(count);for(let i=0;i<3;i++)s=updateStepTouch(s,pose(),t+=100);expect(s.count).toBe(count);});
});
