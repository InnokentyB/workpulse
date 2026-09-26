import { ACTIVITIES } from "@/lib/activity-selector";
import type { ActivityPreferences } from "@/lib/activity-preferences";

type ActivityPreferencesPanelProps = {
  preferences: ActivityPreferences;
  onChange: (preferences: ActivityPreferences) => void;
  onEditSetup?: () => void;
};

export function ActivityPreferencesPanel({
  preferences,
  onChange,
  onEditSetup,
}: ActivityPreferencesPanelProps) {
  function update(
    changes: Partial<ActivityPreferences>,
  ) {
    onChange({ ...preferences, ...changes });
  }

  function toggleExclusion(activityId: string, excluded: boolean) {
    update({
      excludedActivityIds: excluded
        ? [...new Set([...preferences.excludedActivityIds, activityId])]
        : preferences.excludedActivityIds.filter((id) => id !== activityId),
    });
  }

  return (
    <section className="fit-settings" aria-labelledby="fit-settings-heading">
      <div className="fit-settings__heading">
        <div>
          <h2 id="fit-settings-heading">What works right now?</h2>
          <span>Saved on this device</span>
        </div>
        {onEditSetup ? (
          <button onClick={onEditSetup} type="button">
            Edit setup
          </button>
        ) : null}
      </div>
      <div className="fit-settings__toggles">
        <label>
          <input
            checked={preferences.canStand}
            onChange={(event) =>
              update({
                canStand: event.target.checked,
                canLeaveDesk: event.target.checked
                  ? preferences.canLeaveDesk
                  : false,
              })
            }
            type="checkbox"
          />
          <span>I can stand</span>
        </label>
        <label>
          <input
            checked={preferences.canLeaveDesk}
            onChange={(event) =>
              update({
                canLeaveDesk: event.target.checked,
                canStand: event.target.checked ? true : preferences.canStand,
              })
            }
            type="checkbox"
          />
          <span>I can leave my desk</span>
        </label>
        <label>
          <input
            checked={preferences.cameraAllowed}
            onChange={(event) =>
              update({ cameraAllowed: event.target.checked })
            }
            type="checkbox"
          />
          <span>Camera is okay</span>
        </label>
      </div>
      <details className="fit-settings__exclusions">
        <summary>
          Exclude exercises
          {preferences.excludedActivityIds.length > 0
            ? ` · ${preferences.excludedActivityIds.length}`
            : ""}
        </summary>
        <div>
          {ACTIVITIES.map((activity) => (
            <label key={activity.id}>
              <input
                aria-label={`Exclude ${activity.name}`}
                checked={preferences.excludedActivityIds.includes(activity.id)}
                onChange={(event) =>
                  toggleExclusion(activity.id, event.target.checked)
                }
                type="checkbox"
              />
              <span>{activity.name} option</span>
            </label>
          ))}
        </div>
      </details>
    </section>
  );
}
