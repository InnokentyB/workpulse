"use client";

import { useMemo, useState } from "react";

const GITHUB_ISSUE_URL =
  "https://github.com/InnokentyB/workpulse/issues/new";

type CopyState = "idle" | "copied" | "error";

export function FeedbackWorksheet() {
  const [goal, setGoal] = useState("");
  const [timing, setTiming] = useState("Not answered");
  const [change, setChange] = useState("");
  const [context, setContext] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const issueDraft = useMemo(
    () =>
      [
        "## What were you trying to do?",
        goal.trim() || "Not answered",
        "",
        "## Did the suggestion arrive at a useful moment?",
        timing,
        "",
        "## What felt unclear or should change?",
        change.trim() || "Not answered",
        "",
        "## Browser, device, or camera context (optional)",
        context.trim() || "Not answered",
      ].join("\n"),
    [change, context, goal, timing],
  );

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(issueDraft);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="feedback-workspace">
      <div className="feedback-fields">
        <label>
          <span>What were you trying to do?</span>
          <textarea
            onChange={(event) => setGoal(event.target.value)}
            placeholder="For example: find a short break before my next meeting"
            rows={3}
            value={goal}
          />
        </label>

        <label>
          <span>Did the suggestion arrive at a useful moment?</span>
          <select
            onChange={(event) => setTiming(event.target.value)}
            value={timing}
          >
            <option>Not answered</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </select>
        </label>

        <label>
          <span>What felt unclear or should change?</span>
          <textarea
            onChange={(event) => setChange(event.target.value)}
            placeholder="The smallest change that would make WorkPulse more useful"
            rows={3}
            value={change}
          />
        </label>

        <label>
          <span>Browser, device, or camera context</span>
          <textarea
            onChange={(event) => setContext(event.target.value)}
            placeholder="Optional — include only what you are comfortable sharing"
            rows={2}
            value={context}
          />
        </label>
      </div>

      <aside className="feedback-draft" aria-labelledby="feedback-draft-heading">
        <div>
          <h2 id="feedback-draft-heading">Your issue draft</h2>
          <p>
            Nothing typed here is sent or saved. Copy the draft, open GitHub,
            review it, and choose what to post.
          </p>
        </div>
        <textarea aria-label="GitHub issue draft" readOnly rows={14} value={issueDraft} />
        <div className="feedback-draft__actions">
          <button className="button button--paper" onClick={copyDraft} type="button">
            {copyState === "copied" ? "Copied" : "Copy answers"}
          </button>
          <a
            className="button button--evaluate"
            href={GITHUB_ISSUE_URL}
            rel="noreferrer"
            target="_blank"
          >
            Open a GitHub issue
          </a>
        </div>
        <p aria-live="polite" className="feedback-draft__status">
          {copyState === "copied"
            ? "Draft copied. Nothing has been posted yet."
            : copyState === "error"
              ? "Copy was blocked. Select the draft above and copy it manually."
              : "GitHub will open separately; WorkPulse will not fill or submit the issue for you."}
        </p>
      </aside>
    </div>
  );
}
