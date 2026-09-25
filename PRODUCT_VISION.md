# WorkPulse — Product Vision and Roadmap

**Status:** pre-product vision
**Date:** 25 September 2026
**Relationship to the MVP:** `WORKPULSE_SPEC.md` remains the canonical specification for the hackathon build. This document captures the broader product direction and must not expand P0 by implication.

## 1. Product ambition

WorkPulse should evolve from a context-aware movement agent into a private wellbeing coordinator for desk-based work. Its role is to protect the user's physical state and daily rhythm without turning wellbeing into another dashboard to manage.

The product should answer four questions throughout the day:

1. Is this inside the user's intended working day?
2. Does the user need a break, movement, food, therapy, or a change of environment?
3. Is now an appropriate moment to intervene?
4. What is the smallest useful action that fits the available time and context?

The central product principle remains unchanged:

> A correct decision not to interrupt is as valuable as a decision to intervene.

## 2. Product boundaries

WorkPulse is a workplace-wellbeing product. It is not a diagnostic system, medical device, clinical rehabilitation service, nutrition prescription tool, or employee-surveillance system.

- Health and medication schedules are entered or explicitly confirmed by the user.
- The product never invents a dose, changes a prescription, diagnoses pain, or tells a user to compensate for a missed dose.
- Food prompts support a user-defined routine; they do not grade food, prescribe diets, or make guaranteed health claims.
- Camera features are opt-in, processed on-device where feasible, and never retain raw video by default.
- Employer access to personal wellbeing, camera, pain, medication, or activity data is out of scope.

## 3. Decision model

WorkPulse should arbitrate among several kinds of interventions rather than sending independent reminders.

### Decision classes

| Decision | Meaning |
|---|---|
| `START DAY` | The planned workday is beginning. |
| `TAKE A BREAK` | A longer recovery or meal window should be protected. |
| `MOVE NOW` | Movement is useful and interruption cost is acceptable. |
| `NOT NOW` | A need may exist, but interruption would be poorly timed. |
| `THERAPY DUE` | A user-defined medication or therapy window requires acknowledgement. |
| `MEAL WINDOW` | A user-defined meal window is open or about to be lost to calendar load. |
| `ADJUST` | A low-disruption posture, eye, light, or environment adjustment is appropriate. |
| `WRAP UP` | The planned workday is ending. |
| `OUTSIDE WORK HOURS` | Work-related interventions stop and the product protects off-hours. |

### Intervention priority

When prompts conflict, use this default order:

1. User-defined medication or prescribed therapy.
2. Workday ending, sleep protection, and explicit rest boundaries.
3. User-defined meal windows and long breaks.
4. Contextual movement.
5. Posture, eyes, light, and environmental adjustments.

Users must be able to change notification behaviour within safe limits. Medication reminders may remain quietly persistent during a meeting; meal and movement prompts should normally defer to the next appropriate window.

## 4. Workday boundaries

The user defines or confirms:

- usual start of work;
- intended end of work;
- working days;
- preferred meal and long-break windows;
- exceptional late work or travel days;
- quiet hours.

Expected behaviour:

- before the workday, WorkPulse does not generate ordinary movement prompts;
- at the start, it may show a lightweight day overview;
- near the intended end, it shifts from movement optimisation to wrapping up;
- after the end, it avoids prompts that encourage continued work;
- recurring overtime becomes a visible pattern, not a reason to normalize night work.

The hackathon MVP may add start and end times as deterministic hard gates. Full schedule planning is later scope.

## 5. Activity-window taxonomy

Activity selection begins only after WorkPulse decides that an intervention is appropriate.

| Available context | Constraint | Example activity |
|---|---|---|
| 30–60 seconds | User cannot stand | Relax shoulders, move wrists, change posture, look into the distance. |
| 1–3 minutes | User can pause but cannot leave | Seated neck mobility, eye break, gentle breathing. |
| 3–5 minutes | User can stand | Squats, standing stretch, short walk around the room. |
| 5–15 minutes | No immediate commitment | Short walk, stairs, fuller mobility sequence. |
| Audio-only call | User only needs to listen or speak | Walking pad or headphone walk, if enabled by the user. |
| Interactive call | User must type, read, present, or use video | Seated adjustment or no intervention. |

### Context needed for selection

- available minutes before the next commitment;
- whether the user must type, read, present, or watch a screen;
- whether the user can stand or leave the workstation;
- meeting type and participation demand;
- user preferences, exclusions, mobility constraints, pain flags, and available equipment;
- activity completion and dismissal history;
- optional walking pad or standing-desk availability.

### Initial activity library

1. `Neck and shoulder reset` — 60 seconds, seated.
2. `Eye-distance break` — 60 seconds, seated or standing.
3. `10 squats` — approximately 60 seconds, standing.
4. `Walk for 5 minutes` — away from the workstation or on a walking pad.

Preparation time, clothing, outdoor weather, and the return buffer are valuable future inputs but are not needed for the first product slice.

The canonical meeting-soon demo remains unchanged: two minutes before an important meeting, WorkPulse says `NOT NOW`. Offering a seated exercise there would weaken the core proof that the agent can choose restraint.

## 6. Medication and ongoing therapy

Medication and therapy reminders reproduce a schedule explicitly entered or confirmed by the user. They do not create medical instructions.

### User-provided fields

- medication, supplement, exercise, or therapy name;
- dose or instruction exactly as provided;
- exact time or acceptable window;
- recurrence pattern;
- conditions such as “with food” only when entered by the user;
- preferred reminder persistence and snooze interval;
- optional private notes.

### Reminder actions

- `Taken` / `Completed`
- `Remind me later`
- `Skip today`

### Required safeguards

- Never recommend changing or doubling a dose.
- After a missed window, say: `This scheduled window has passed. Follow the instructions from your clinician or medication.`
- Do not silently infer a link between medication and a meal.
- Treat medication and pain data as sensitive personal data.
- Keep reminders private on shared screens and notification previews by default.
- Provide export and deletion controls before cloud synchronization is introduced.

Observable success: a due reminder remains available until acknowledged according to the user's settings, and the acknowledgement is stored without exposing it to other users or employers.

## 7. Meal windows

Meal support protects a user-defined routine. It does not require food logging in the initial release.

### User-provided fields

- meal name;
- preferred time window;
- typical minimum duration;
- advance-warning preference;
- working days or exceptions.

### Expected behaviour

- identify an appropriate calendar gap inside the meal window;
- warn before a long sequence of meetings would eliminate the window;
- offer `Ate`, `Later`, and `Skip today`;
- avoid moral language, calorie judgments, and “good/bad food” classifications;
- describe reduced hunger-driven or impulsive snacking as a possible benefit, not a guarantee.

Example prompt:

> **A good window for lunch**
> Your next meeting starts in 40 minutes, so there is time to eat without rushing.

Food composition, nutrition targets, allergies, and meal suggestions are later discovery areas and require stronger safety, inclusion, and evidence work.

## 8. Future wellbeing modules

### Posture

- Offer occasional low-disruption posture changes while the user continues working.
- Potential suggestions: relax shoulders, reposition feet, change sitting position, or adjust viewing distance.
- Camera-based assessment is optional, user-initiated, visibly active, and processed locally where feasible.

### Ergonomics

- Guided self-check for screen height, chair, desk, keyboard, lighting, and viewing distance.
- Advice stays general and does not diagnose pain or injury.
- Pain reports should exclude unsuitable activities and may recommend seeking qualified care when appropriate.

### Light and daily rhythm

- Protect exposure to daylight during the working day.
- Offer user-controlled morning/daylight and evening screen-light routines.
- Avoid rigid claims about sunrise, sunset, sleep treatment, or guaranteed circadian outcomes.
- Use location and daylight data only after explicit permission.

### Room environment

- Start with subjective prompts: comfort, heat, cold, stuffiness, and whether opening a window is practical.
- Later integrations may read temperature, humidity, or CO2 sensors.
- Do not claim to measure oxygen without a supported sensor.
- Recommendations must consider weather, air quality, noise, and user control of the space before suggesting that a window be opened.

### Wearables and equipment

Potential integrations include Apple Health / Apple Watch, Google Health Connect, WHOOP, Oura, Garmin, Fitbit, walking pads, standing desks, and room sensors.

Wearable data may improve timing and activity intensity, but it cannot override explicit user constraints, medication instructions, calendar hard gates, or privacy settings.

## 9. Data and permission model

| Data | Default owner | Initial storage | Permission rule |
|---|---|---|---|
| Work schedule and calendar context | User | local/browser for prototype | explicit calendar connection later |
| Movement history | User | local/browser | no employer access |
| Meal schedule | User | local first | user-created or imported with confirmation |
| Medication and therapy schedule | User | encrypted/private store before cloud sync | explicit entry and private notifications |
| Camera posture data | User | processed ephemerally on-device | separate opt-in; raw frames not retained |
| Wearable data | User/device provider | minimum derived signals | per-provider authorization and revocation |
| Environment sensor data | User/device owner | local or minimal cloud sync | device-specific permission |

The product should prefer derived facts such as “movement need high” over retaining raw sensitive data whenever possible.

## 10. Roadmap

### P0 — Hackathon proof: committed

**Outcome:** demonstrate that context changes whether WorkPulse intervenes.

- Three deterministic scenarios.
- `MOVE NOW` and `NOT NOW` with explanations.
- Tiny activity, completion, dismissal, cooldown, and local history.
- Responsive public demo.

**Success:** judges understand the contrast between a timer and an agent within the live demo.

### P0.5 — Useful personal prototype: proposed next slice

**Outcome:** make the prototype useful for one person's real workday without adding medical complexity.

- Explicit connection to the user's real calendar, replacing fixed demo context with upcoming events and free windows.
- User-defined workday start and end.
- Meal and long-break windows without nutrition analysis.
- Activity selection by available time and ability to stand.
- Initial seated, standing, eye, and walking activities.
- Explicit user preferences and exclusions.

**Dependencies:** calendar authorization and revocation, settings UI, local schedule persistence, arbitration between prompt types.
**Success:** the user completes useful interventions while reporting that badly timed prompts remain rare.

### P1 — Personal routines and adaptation: tentative

**Outcome:** coordinate recurring wellbeing commitments privately.

- User-defined medication and therapy reminders with safeguards.
- Completion/dismissal-based activity preference learning.
- Calendar participation context where available.
- Private notification controls and data export/deletion.

**Dependencies:** privacy model, secure persistence, notification reliability, medication safety review.
**Success:** scheduled therapy prompts are delivered and acknowledged reliably without the product generating medical instructions.

### P2 — Ambient assistance: exploratory

**Outcome:** help the user improve posture and environment with explicit consent.

- On-device posture checks.
- Ergonomic workspace self-assessment.
- Daylight and evening-light routines.
- Temperature and CO2 sensor integrations.
- Wearable and walking-pad integrations.

**Dependencies:** device APIs, consent design, local processing, sensor reliability, accessibility validation.
**Success:** users find adjustments useful and non-invasive, with camera and sensor data remaining under their control.

### P3 — Coordinated personal wellbeing platform: uncommitted

- Cross-device synchronization.
- Richer routine planning.
- Safe personalization across work, movement, food, light, and environment.
- Optional professional or clinician-supported plans only after compliance and product-boundary review.

## 11. Riskiest assumptions

1. Users will trust a product that combines calendar, activity, meals, and sensitive routines if controls remain understandable and local-first.
2. A single arbitration system can reduce interruption fatigue instead of becoming another source of notifications.
3. Users will provide enough context about meeting demands and physical constraints for activity selection to be meaningfully better than a timer.
4. Medication reminders can be reliable enough to be useful without implying clinical responsibility.
5. Camera-based posture guidance can deliver value without feeling like surveillance.

These assumptions should be tested independently. Failure of a later health module must not undermine the simple movement-decision loop.

## 12. Near-term discovery questions

- Which one or two workday boundaries create the most immediate value: start, end, lunch, or a long-break window?
- Will users configure whether they can stand, walk, or use a walking pad globally, per location, or per meeting?
- How should audio-only versus interactive meetings be determined and corrected by the user?
- What level of reminder persistence is acceptable for medication without creating alarm fatigue?
- How should meal prompting accommodate fasting, shift work, eating disorders, caregiving, and cultural differences?
- Which data must remain local for the product to earn trust, even if cross-device sync becomes available?
