import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect} from 'vitest';
import {PersonalDayTimeline} from './PersonalDayTimeline';
afterEach(cleanup);
const start=new Date('2026-10-26T09:30:00Z').getTime(),end=start+8*3600000;
describe('private calendar day timeline',()=>{
 it('shows actual date, local timezone, hours, now and explicit free/busy/break agenda',()=>{
 render(<PersonalDayTimeline timeline={{start,end,busy:[{start:start+1800000,end:start+3600000}],observedAt:start}} forecast={{start:start+3600000,end:start+3900000}} now={start+600000}/>);
 expect(screen.getByRole('heading',{name:'Calendar day'})).toBeTruthy();expect(screen.getByText(/Time zone:/)).toBeTruthy();expect(screen.getByText('Now')).toBeTruthy();expect(screen.getByText(/Recommended break:/)).toBeTruthy();expect(screen.getByLabelText('Calendar agenda').textContent).toContain('Busy');expect(screen.getByLabelText('Calendar agenda').textContent).toContain('Free');expect(screen.getAllByText(/10:00/).length).toBeGreaterThan(0);
 });
 it('never invents calendar blocks when fresh data is unavailable',()=>{render(<PersonalDayTimeline timeline={null} forecast={null} now={start}/>);expect(screen.getByText(/Fresh calendar availability is needed/)).toBeTruthy();expect(screen.queryByTestId('calendar-grid')).toBeNull();expect(screen.queryByText(/Recommended break:/)).toBeNull();});
 it('normalizes overlapping busy intervals into an honest free/busy agenda',()=>{render(<PersonalDayTimeline timeline={{start,end,busy:[{start:start+1000,end:start+3000},{start:start+2000,end:start+4000}],observedAt:start}} forecast={null} now={start}/>);expect(screen.getByLabelText('Calendar agenda').querySelectorAll('[data-kind="busy"]').length).toBe(1);});
});
