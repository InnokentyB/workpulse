"use client";

import { useState } from "react";

import { clearWorkPulseLocalData } from "@/lib/local-data";

type ClearState = "idle" | "confirming" | "cleared" | "error";

export function LocalDataControls() {
  const [state, setState] = useState<ClearState>("idle");

  function clearData() {
    try {
      const result = clearWorkPulseLocalData(window.localStorage);
      setState(result.failedKeys.length === 0 ? "cleared" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "confirming") {
    return (
      <div className="local-data-action local-data-action--confirm">
        <div>
          <strong>Delete this browser’s WorkPulse data?</strong>
          <p>
            This removes your activity history, preferences, onboarding answers,
            and dismissal history. It cannot be undone.
          </p>
        </div>
        <div className="local-data-action__buttons">
          <button className="button button--danger" onClick={clearData} type="button">
            Yes, delete it
          </button>
          <button
            className="button button--paper"
            onClick={() => setState("idle")}
            type="button"
          >
            Keep my data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="local-data-action">
      <div aria-live="polite">
        {state === "cleared" ? (
          <>
            <strong>Local data deleted.</strong>
            <p>Reload the demo to start again with default settings.</p>
          </>
        ) : state === "error" ? (
          <>
            <strong>We could not delete all local data.</strong>
            <p>
              Check whether browser storage is blocked, then try again. You can
              also clear site data for WorkPulse in your browser settings.
            </p>
          </>
        ) : (
          <>
            <strong>You control what stays on this device.</strong>
            <p>
              Deleting local data does not change camera permission saved by your
              browser. You can revoke that separately in browser site settings.
            </p>
          </>
        )}
      </div>
      <button
        className="button button--paper"
        onClick={() => setState("confirming")}
        type="button"
      >
        {state === "error" ? "Try deleting again" : "Delete all local data"}
      </button>
    </div>
  );
}
