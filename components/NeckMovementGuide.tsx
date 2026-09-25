import type { NeckMotionState } from "@/lib/neck-motion-tracker";

type CueDirection = "both" | "left" | "right" | "down" | "up" | "center";

const MOVEMENT_STEPS: Array<{
  cue: CueDirection;
  label: string;
}> = [
  { cue: "left", label: "Turn to one side" },
  { cue: "right", label: "Turn to the other" },
  { cue: "down", label: "Lower your chin" },
  { cue: "up", label: "Lift your gaze slightly" },
];

function CueArrow({ direction }: { direction: CueDirection }) {
  if (direction === "both") {
    return (
      <>
        <path d="M25 25C34 12 62 12 71 25" />
        <path d="m25 25 3-10m-3 10 10-1M71 25l-3-10m3 10-10-1" />
      </>
    );
  }

  if (direction === "left" || direction === "right") {
    const path =
      direction === "left"
        ? "M72 24C62 11 38 11 25 25"
        : "M24 24C34 11 58 11 71 25";
    const head = direction === "left" ? "m25 25 3-10m-3 10 10-1" : "m71 25-3-10m3 10-10-1";
    return (
      <>
        <path d={path} />
        <path d={head} />
      </>
    );
  }

  if (direction === "down") {
    return (
      <>
        <path d="M72 17c8 16 2 32-11 39" />
        <path d="m61 56 3-10m-3 10 10-1" />
      </>
    );
  }

  if (direction === "up") {
    return (
      <>
        <path d="M65 58c10-13 10-28 1-40" />
        <path d="m66 18-1 11m1-11 9 5" />
      </>
    );
  }

  return <circle cx="48" cy="34" r="24" strokeDasharray="3 6" />;
}

function NeckCueIcon({ direction }: { direction: CueDirection }) {
  const faceOffset = direction === "left" ? -5 : direction === "right" ? 5 : 0;
  const headOffset = direction === "down" ? 3 : direction === "up" ? -3 : 0;

  return (
    <svg aria-hidden="true" className="neck-cue" viewBox="0 0 96 92">
      <g className="neck-cue__figure" transform={`translate(0 ${headOffset})`}>
        <circle cx="48" cy="36" r="17" />
        <path d="M40 52v8m16-8v8M20 82c3-14 14-22 28-22s25 8 28 22" />
        <path d={`M${48 + faceOffset} 30v8`} />
        <circle className="neck-cue__face-point" cx={48 + faceOffset} cy="43" r="1.5" />
      </g>
      <g className="neck-cue__arrow">
        <CueArrow direction={direction} />
      </g>
    </svg>
  );
}

function liveCue(motion: NeckMotionState): {
  direction: CueDirection;
  label: string;
} {
  if (motion.tracking === "out-of-frame") {
    return { direction: "center", label: "Face and shoulders in frame" };
  }

  switch (motion.stage) {
    case "calibrating":
      return { direction: "center", label: "Hold neutral" };
    case "first-side":
      return { direction: "both", label: "Turn to either side" };
    case "opposite-side":
      return {
        direction: motion.firstSideDirection === 1 ? "left" : "right",
        label: "Turn to the other side",
      };
    case "down":
      return { direction: "down", label: "Chin down" };
    case "up":
      return { direction: "up", label: "Gaze slightly up" };
    case "center":
    case "complete":
      return { direction: "center", label: "Return to neutral" };
  }
}

export function NeckMovementPreview() {
  return (
    <section className="movement-preview" aria-labelledby="movement-preview-heading">
      <div className="movement-preview__heading">
        <h3 id="movement-preview-heading">Your movement sequence</h3>
        <p>Start on either side. Move slowly and return through center.</p>
      </div>
      <ol>
        {MOVEMENT_STEPS.map((step, index) => (
          <li key={step.label}>
            <span className="movement-preview__number">{index + 1}</span>
            <NeckCueIcon direction={step.cue} />
            <strong>{step.label}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LiveNeckCue({ motion }: { motion: NeckMotionState }) {
  const cue = liveCue(motion);

  return (
    <div className="live-neck-cue" aria-hidden="true">
      <NeckCueIcon direction={cue.direction} />
      <strong>{cue.label}</strong>
    </div>
  );
}
