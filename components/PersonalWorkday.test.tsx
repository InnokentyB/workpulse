import { act, fireEvent, render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PersonalWorkday } from './PersonalWorkday';
vi.mock('./StepTouchChallenge',()=>({StepTouchChallenge:({onCycle}:{onCycle:(n:number)=>Promise<boolean>})=><button onClick={()=>void onCycle(1)}>Fixture camera cycle</button>}));
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});
const base={configured:true,connected:true,calendars:[{id:'primary',name:'My calendar',primary:true}],selected:['primary'],workStartedAt:null,dueAt:null,lastCompletedAt:null,history:[],run:null,timeline:{start:Date.now(),end:Date.now()+8*3600000,busy:[],observedAt:Date.now()},breakForecast:null,forecastReason:'start-work',availability:{observedAt:Date.now(),isBusy:false,freeMinutes:20,reason:'Free'},decision:'start-work'};
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
describe('Personal workday user boundary',()=>{
 it('defaults to a desk-friendly arms challenge rather than a full-body route',async()=>{
  const fetcher=vi.fn().mockResolvedValue(json(base));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);
  const arms=await screen.findByRole('radio',{name:/Lantern arms/});expect((arms as HTMLInputElement).checked).toBe(true);
  expect(screen.getByRole('radio',{name:/Shoulder lifts/})).toBeTruthy();
  expect(screen.queryByRole('radio',{name:/Lantern route/})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Start exercise now'}));
  await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({action:'start-exercise',exerciseId:'lantern-arms',goal:'trail'});
 });
 it('lets the user discard an unfinished older exercise before choosing arms, without enabling camera',async()=>{
  const old={id:'old-shoulders',goal:'trail',count:1,status:'paused',exerciseId:'shoulder-rolls',target:6,source:'chosen'};
  const fetcher=vi.fn().mockResolvedValueOnce(json({...base,run:old})).mockResolvedValueOnce(json(base));
  vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);
  fireEvent.click(await screen.findByRole('button',{name:'Discard unfinished round'}));
  await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({action:'discard-run',runId:old.id});
  expect((screen.getByRole('radio',{name:/Lantern arms/}) as HTMLInputElement).checked).toBe(true);
 });
 it('starts a chosen neck exercise before the scheduled break and records it in the same history',async()=>{
  const now=Date.now(),run={id:'neck-run',goal:'trail',count:0,status:'active',exerciseId:'neck-reset',source:'chosen',target:4,startedAt:now};
  const fetcher=vi.fn().mockResolvedValueOnce(json({...base,workStartedAt:now,dueAt:now+2700000,decision:'wait'})).mockResolvedValueOnce(json({...base,run,runLease:'neck-lease'})).mockResolvedValueOnce(json({...base,run:{...run,count:1}}));
  vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);
  fireEvent.click(await screen.findByRole('radio',{name:/Neck reset/}));
  fireEvent.click(screen.getByRole('button',{name:'Start exercise now'}));
  await screen.findByRole('button',{name:'Fixture camera cycle'});
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({action:'start-exercise',exerciseId:'neck-reset',goal:'trail'});
  fireEvent.click(screen.getByRole('button',{name:'Fixture camera cycle'}));
  await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetcher.mock.calls[2][1].body)).toEqual({action:'progress',runId:'neck-run',lease:'neck-lease',count:1,exerciseId:'neck-reset'});
 });
 it('shows a persisted named exercise with camera count and elapsed time after reload',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,history:[{id:'neck-one',exerciseId:'neck-reset',source:'chosen',goal:'trail',steps:4,completedAt:Date.now(),elapsedSeconds:42}]})));
  render(<PersonalWorkday/>);await screen.findByRole('heading',{name:'Activity history'});
  const history=within(screen.getByRole('region',{name:'Activity history'}));expect(history.getByText(/4 camera-recognized movements/)).toBeTruthy();expect(history.getByText(/42 sec elapsed/)).toBeTruthy();
 });
 it('explains desk-friendly movement before starting a round',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,workStartedAt:1,dueAt:1,decision:'move'})));
  render(<PersonalWorkday/>);
  await screen.findByRole('button',{name:'Start camera challenge'});
  expect(screen.getByText(/Arms sideways, lower; arms overhead, lower/)).toBeTruthy();
 });
 it('labels an unversioned saved round as the earlier exercise',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,run:{id:'legacy',goal:'trail',count:6,status:'paused'}})));
  render(<PersonalWorkday/>);
  expect(await screen.findByText(/This saved round uses the earlier eight-step exercise/)).toBeTruthy();
 });
 it('describes the achieved route after reload without reinterpreting old history',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,decision:'wait',run:{id:'route',goal:'trail',count:8,status:'complete',movementVersion:'route-v1'},history:[{id:'route',goal:'trail',steps:8,completedAt:1,movementVersion:'route-v1'},{id:'old',goal:'trail',steps:8,completedAt:1}]})));
  render(<PersonalWorkday/>);
  expect(await screen.findByText(/You walked to the gate, opened it and lit the lantern/)).toBeTruthy();
  expect(screen.getByText('Gate opened · lantern lit')).toBeTruthy();
  expect(screen.getByText('Summit reached')).toBeTruthy();
 });
 it('shows honest unconfigured setup and separate real-camera practice',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,configured:false,connected:false,calendars:[],selected:[],decision:'setup'})));render(<PersonalWorkday/>);await screen.findByText(/Google connection is not configured/);expect(screen.getByRole('link',{name:/Try camera challenge/}).getAttribute('href')).toBe('/move');expect(screen.queryByRole('button',{name:'Start camera challenge'})).toBeNull();});
 it('starts elapsed work session only on explicit action',async()=>{const fetcher=vi.fn().mockResolvedValueOnce(json(base)).mockResolvedValueOnce(json({...base,workStartedAt:Date.now(),dueAt:Date.now()+45*60000,decision:'wait',availability:{observedAt:Date.now(),isBusy:false,freeMinutes:20,reason:'Free'}}));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);fireEvent.click(await screen.findByRole('button',{name:'Start work session'}));await screen.findByText('WAIT');expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({action:'start-work'});});
 it('cannot start a challenge from unknown availability',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,decision:'unknown',workStartedAt:1})));render(<PersonalWorkday/>);await screen.findByText('Availability unknown');expect(screen.queryByRole('button',{name:'Start camera challenge'})).toBeNull();});
 it('saves camera progress under the issued run lease',async()=>{const run={id:'run-one',goal:'trail',count:0,status:'active'};const fetcher=vi.fn().mockResolvedValueOnce(json({...base,workStartedAt:1,dueAt:1,decision:'move'})).mockResolvedValueOnce(json({...base,workStartedAt:1,dueAt:1,decision:'move',run,runLease:'lease-one'})).mockResolvedValueOnce(json({...base,run:{...run,count:1}}));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);fireEvent.click(await screen.findByRole('button',{name:'Start camera challenge'}));fireEvent.click(await screen.findByRole('button',{name:'Fixture camera cycle'}));await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(3));expect(JSON.parse(fetcher.mock.calls[2][1].body)).toEqual({action:'progress',runId:'run-one',lease:'lease-one',count:1});});
 it('requires explicit resume after a page reload, not a leaked lease',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,run:{id:'old-run',goal:'trail',count:3,status:'paused'}})));render(<PersonalWorkday/>);await screen.findByRole('button',{name:'Resume unfinished round'});expect(screen.queryByRole('button',{name:'Fixture camera cycle'})).toBeNull();});
});

it('keeps the achieved goal visible after a completed round is reloaded',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,decision:'wait',run:{id:'finished',goal:'workshop',count:8,status:'complete'}})));
 render(<PersonalWorkday/>);await screen.findByRole('heading',{name:'Round complete · 8/8'});
 expect(screen.getByRole('img',{name:/completed 8 of 8 steps/})).toBeTruthy();
});

describe('calendar-first day assistant',()=>{
 it('loads fresh availability immediately and shows nearest eligible free slot',async()=>{const now=Date.now(),forecast={start:now+3600000,end:now+3900000};const fetcher=vi.fn().mockResolvedValue(json({...base,workStartedAt:now,decision:'wait',dueAt:now+2700000,timeline:{start:now,end:now+8*3600000,busy:[{start:now+2700000,end:now+3600000}],observedAt:now},breakForecast:forecast,forecastReason:'after-busy'}));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);await screen.findByRole('heading',{name:'My day'});await screen.findByRole('heading',{name:'Calendar day'});expect(fetcher.mock.calls[0][0]).toBe('/api/personal?refresh=1');expect(screen.getByText(/after the busy calendar block/)).toBeTruthy();});
 it('removes the previous forecast and timeline after a failed refresh',async()=>{const now=Date.now(),fetcher=vi.fn().mockResolvedValueOnce(json({...base,decision:'wait',timeline:{start:now,end:now+8*3600000,busy:[],observedAt:now},breakForecast:{start:now+2700000,end:now+3000000},forecastReason:'after-due'})).mockRejectedValueOnce(Error('Calendar unavailable'));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);await screen.findByTestId('calendar-grid');fireEvent.click(screen.getByRole('button',{name:'Check calendar now'}));await screen.findByText('Calendar unavailable');expect(screen.queryByTestId('calendar-grid')).toBeNull();expect(screen.queryByText(/Recommended break:/)).toBeNull();});
 it('does not display stale forecast or a stale move invitation',async()=>{const now=Date.now();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,workStartedAt:1,dueAt:1,decision:'move',availability:{observedAt:now-91000,isBusy:false,freeMinutes:10,reason:'Free'},timeline:{start:now,end:now+8*3600000,busy:[],observedAt:now-91000},breakForecast:{start:now,end:now+300000},forecastReason:'due-now'})));render(<PersonalWorkday/>);await screen.findByText('Availability unknown');expect(screen.queryByTestId('calendar-grid')).toBeNull();expect(screen.queryByRole('button',{name:'Start camera challenge'})).toBeNull();expect(screen.queryByTestId('break-invitation')).toBeNull();});
 it('explains separate inspector consent and directs configured users to main connect',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,connected:false,decision:'setup'})));render(<PersonalWorkday/>);expect(await screen.findByText(/calendar inspector uses separate temporary access/i)).toBeTruthy();expect(screen.getByRole('link',{name:'Connect Google Calendar'}).getAttribute('href')).toBe('/api/personal/google/start');expect(screen.queryByRole('link',{name:'Open Google setup'})).toBeNull();});
 it('offers a visible in-app invitation only on fresh due-now availability',async()=>{const now=Date.now();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,workStartedAt:1,dueAt:1,decision:'move',availability:{observedAt:now,isBusy:false,freeMinutes:10,reason:'Free'},timeline:{start:now,end:now+8*3600000,busy:[],observedAt:now},breakForecast:{start:now,end:now+300000},forecastReason:'due-now'})));render(<PersonalWorkday/>);expect(await screen.findByTestId('break-invitation')).toBeTruthy();expect(screen.getByTestId('break-invitation').getAttribute('role')).toBe('status');});
});

 it('hides due-now invitations while the page is hidden and refreshes on return',async()=>{const now=Date.now(),visibility=vi.spyOn(document,'visibilityState','get').mockReturnValue('hidden');const fetcher=vi.fn().mockImplementation(async()=>json({...base,workStartedAt:1,dueAt:1,decision:'move',availability:{observedAt:now,isBusy:false,freeMinutes:10,reason:'Free'},timeline:{start:now,end:now+8*3600000,busy:[],observedAt:now},breakForecast:{start:now,end:now+300000},forecastReason:'due-now'}));vi.stubGlobal('fetch',fetcher);render(<PersonalWorkday/>);await screen.findByRole('button',{name:'Start camera challenge'});expect(screen.queryByTestId('break-invitation')).toBeNull();visibility.mockReturnValue('visible');fireEvent(document,new Event('visibilitychange'));await screen.findByTestId('break-invitation');await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(2));expect(fetcher.mock.calls[1][0]).toBe('/api/personal?refresh=1');});

 it('requires a fresh interval snapshot before inviting from a legacy state',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,workStartedAt:1,dueAt:1,decision:'move',timeline:undefined,breakForecast:undefined})));render(<PersonalWorkday/>);await screen.findByText('Availability unknown');expect(screen.queryByRole('button',{name:'Start camera challenge'})).toBeNull();expect(screen.queryByTestId('calendar-grid')).toBeNull();});

 it('withdraws a move invitation as a five-minute gap becomes shorter while still fresh',async()=>{vi.useFakeTimers({toFake:['Date','setInterval','clearInterval']});const now=Date.now();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(json({...base,workStartedAt:now-2700000,dueAt:now,decision:'move',availability:{observedAt:now,isBusy:false,freeMinutes:5,reason:'Free'},timeline:{start:now,end:now+8*3600000,busy:[{start:now+300000,end:now+3600000}],observedAt:now},breakForecast:{start:now,end:now+300000},forecastReason:'due-now'})));render(<PersonalWorkday/>);await screen.findByTestId('break-invitation');await act(async()=>{vi.advanceTimersByTime(1000);});expect(screen.queryByTestId('break-invitation')).toBeNull();expect(screen.queryByRole('button',{name:'Start camera challenge'})).toBeNull();expect(screen.getByText(/after the busy calendar block/)).toBeTruthy();vi.useRealTimers();});
