import "./movement-scene.css";

export type MovementSceneProps = {
  scene: "trail" | "workshop";
  completedCycles: number;
  status: "ready" | "active" | "paused" | "complete";
};

const trailStops = [
  { x: 76, y: 238 }, { x: 158, y: 217 }, { x: 245, y: 194 },
  { x: 332, y: 161 }, { x: 418, y: 127 }, { x: 502, y: 95 }, { x: 569, y: 61 },
];

const lanternStages = [
  "Empty workbench", "Frame assembled", "Panels fitted", "Handle attached",
  "Wick fitted", "First light", "Lantern glowing",
];

function Traveler({ x, y, facing = 1 }: { x: number; y: number; facing?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${facing} 1)`} className="movement-scene__traveler">
      <ellipse cx="0" cy="5" rx="18" ry="4" fill="#183e2f" opacity=".16" />
      <path d="M-9-27 Q-22-23-19-6 L-12-3 L-7-23Z" fill="#bb754d" stroke="#183e2f" strokeWidth="2" />
      <path d="M-6-31 Q8-34 13-21 L10-8 L-8-8Z" fill="#e3eacb" stroke="#183e2f" strokeWidth="2.5" />
      <path d="M-5-8 L-9 2 M7-8 L10 2" fill="none" stroke="#183e2f" strokeWidth="4" strokeLinecap="round" />
      <path d="M10-24 L19-14" fill="none" stroke="#183e2f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="3" cy="-42" r="10" fill="#c98d62" stroke="#183e2f" strokeWidth="2" />
      <path d="M-9-45 Q-3-59 9-51 L15-44 Q3-47-9-45Z" fill="#183e2f" />
      <circle cx="8" cy="-42" r="1.4" fill="#183e2f" />
      <path d="M-8-32 Q-13-28-12-20" fill="none" stroke="#183e2f" strokeWidth="2" />
    </g>
  );
}

function Trail({ cycles }: { cycles: number }) {
  const traveler = trailStops[cycles];
  return (
    <svg viewBox="0 0 640 300" className="movement-scene__art" aria-hidden="true" focusable="false">
      <path d="M0 226 Q110 199 199 221 T391 191 T640 151 V300 H0Z" fill="#e7ecd9" />
      <path d="M0 260 Q120 240 220 252 T451 209 T640 193 V300 H0Z" fill="#cfddc3" />
      <circle cx="551" cy="45" r="25" fill="#e7f7a3" />
      <path d="M0 276 Q100 266 183 272 T359 251 T640 230 V300 H0Z" fill="#adca9c" />
      <path d="M52 244 C192 227 264 206 334 170 C426 121 507 115 577 63" fill="none" stroke="#7b9b76" strokeWidth="3" strokeDasharray="5 8" strokeLinecap="round" />
      {trailStops.map((stop, index) => (
        <g key={index}>
          <ellipse cx={stop.x} cy={stop.y + 6} rx="28" ry="7" fill={index <= cycles ? "#b8f36b" : "#f8f8ee"} stroke="#376650" strokeWidth="2" />
          <text x={stop.x} y={stop.y + 1} textAnchor="middle" fill="#254b39" fontSize="10" fontWeight="700">{index === 0 ? "START" : index === 6 ? "TOP" : String(index).padStart(2, "0")}</text>
        </g>
      ))}
      <path d="M567 49 V18 l31 11-31 10" fill="#b8f36b" stroke="#183e2f" strokeWidth="2" strokeLinejoin="round" />
      <path d="M567 18 V60" stroke="#183e2f" strokeWidth="3" strokeLinecap="round" />
      <Traveler x={traveler.x} y={traveler.y - 2} />
      <path d="M39 88 l20-44 21 44 M466 70 l11-23 12 23" fill="none" stroke="#a7c59b" strokeWidth="2" opacity=".65" />
    </svg>
  );
}

function Workshop({ cycles }: { cycles: number }) {
  const steps = ["Frame", "Panels", "Handle", "Wick", "Light", "Glow"];
  return (
    <svg viewBox="0 0 640 300" className="movement-scene__art" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="640" height="300" fill="#e6ebdb" />
      <path d="M0 228 H640 V300 H0Z" fill="#c3d4b2" />
      <path d="M35 229 H612 M50 241 H595" stroke="#3e674b" strokeWidth="3" />
      <rect x="105" y="100" width="184" height="125" rx="10" fill="#f9f7ed" stroke="#a0b19b" strokeWidth="2" />
      <path d="M130 130 H263 M130 153 H240 M130 176 H254" stroke="#aec2a5" strokeWidth="3" strokeLinecap="round" />
      <path d="M216 198 l23-17 19 18-23 12Z" fill="#dff1cc" stroke="#527f60" strokeWidth="2" />
      <text x="130" y="120" fill="#3d6f50" fontSize="11" fontWeight="700" letterSpacing="2">FIELD NOTES</text>
      <Traveler x={344} y={220} facing={-1} />
      <ellipse cx="478" cy="220" rx="64" ry="8" fill="#244d38" opacity=".15" />
      {cycles >= 1 && <path d="M449 217 L455 151 L501 151 L507 217Z" fill="none" stroke="#365d45" strokeWidth="5" strokeLinejoin="round" />}
      {cycles >= 2 && <path d="M455 153 L501 153 L499 213 L457 213Z" fill="#e9f3cc" stroke="#365d45" strokeWidth="2" />}
      {cycles >= 3 && <path d="M462 151 Q478 112 494 151" fill="none" stroke="#365d45" strokeWidth="5" strokeLinecap="round" />}
      {cycles >= 4 && <path d="M479 215 V190 M471 193 H487" stroke="#895e40" strokeWidth="3" strokeLinecap="round" />}
      {cycles >= 5 && <><circle cx="478" cy="184" r="21" fill="#d5fa79" opacity=".48" /><path d="M478 194 C466 182 475 177 478 167 C484 178 491 184 478 194Z" fill="#d6e34e" stroke="#7d8b37" strokeWidth="1.5" /></>}
      {cycles >= 6 && <><circle cx="478" cy="183" r="39" fill="#eaffaa" opacity=".37" /><path d="M537 164 l6-7 M531 130 v-9 M558 188 h10" stroke="#719147" strokeWidth="3" strokeLinecap="round" /></>}
      <path d="M412 217 H541" stroke="#355943" strokeWidth="3" strokeLinecap="round" />
      {steps.map((step, index) => (
        <g key={step} transform={`translate(${113 + index * 79} 260)`}>
          <circle r="7" fill={index < cycles ? "#15684a" : "#f7f7ee"} stroke="#51765c" strokeWidth="2" />
          <text y="23" textAnchor="middle" fill="#365845" fontSize="10" fontWeight="600">{step}</text>
        </g>
      ))}
      <path d="M120 260 H510" stroke="#839f7b" strokeWidth="1" opacity=".6" />
    </svg>
  );
}

export default function MovementScene({ scene, completedCycles, status }: MovementSceneProps) {
  const cycles = Number.isFinite(completedCycles) ? Math.max(0, Math.min(6, Math.floor(completedCycles))) : 0;
  const label = scene === "trail" ? "Summit trail" : "Lantern workshop";
  const description = scene === "trail"
    ? `Traveler has reached stop ${cycles} of 6 on the summit trail.`
    : `Lantern assembly has completed ${cycles} of 6 steps. ${lanternStages[cycles]}.`;
  return (
    <figure className="movement-scene" data-scene={scene} data-status={status}>
      <div className="movement-scene__header">
        <span className="movement-scene__eyebrow">{scene === "trail" ? "A small journey" : "A little craft"}</span>
        <span className="movement-scene__count">{cycles} / 6</span>
      </div>
      <div role="img" aria-label={`${label}. ${description}`} className="movement-scene__canvas">
        {scene === "trail" ? <Trail cycles={cycles} /> : <Workshop cycles={cycles} />}
      </div>
      <figcaption className="movement-scene__caption">
        <strong>{label}</strong>
        <span aria-live="polite">{description}</span>
      </figcaption>
    </figure>
  );
}
