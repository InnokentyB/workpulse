type IconProps = {
  className?: string;
};

export function PulseMark({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 42 42"
      fill="none"
    >
      <path
        d="M5 22h7l3.5-8.5 6.2 17L26 19l2.4 3H37"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="m4.5 10.3 3.3 3.3 7.7-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="15"
        x="2.5"
        y="4"
      />
      <path
        d="M6 2.5v3M14 2.5v3M2.5 8h15M6 11h2M11 11h3M6 14h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="14"
        x="2"
        y="5"
      />
      <path
        d="m16 8 2.5-1.5v8L16 13M4 3l12 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ShoulderRollsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-icon="shoulder-rolls"
      fill="none"
      viewBox="0 0 48 48"
    >
      <circle cx="24" cy="10.5" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M20 18.5v5M28 18.5v5M10.5 37c1.6-8.4 6.1-12.5 13.5-12.5S35.9 28.6 37.5 37"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M16.2 23.8c-5.5-.8-9.5 2-10.2 7.1-.3 2.2.2 4.2 1.5 5.8M31.8 23.8c5.5-.8 9.5 2 10.2 7.1.3 2.2-.2 4.2-1.5 5.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <path
        d="m4.2 33.7 3.3 3 2.8-3.5M43.8 33.7l-3.3 3-2.8-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function NeckResetIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-icon="neck-reset"
      fill="none"
      viewBox="0 0 48 48"
    >
      <circle cx="24" cy="21" r="8.5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M19.5 30v4M28.5 30v4M11 41c1.5-5.2 5.8-7.8 13-7.8S35.5 35.8 37 41"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M7 9h12M7 9l3.5-3.5M7 9l3.5 3.5M41 9H29M41 9l-3.5-3.5M41 9l-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M24 7V3m0 36v6m0-42-3 3m3-3 3 3m-3 39-3-3m3 3 3-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function EyeCareIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} data-icon="eye-care-break" fill="none" viewBox="0 0 48 48">
      <path d="M5 24s7-10 19-10 19 10 19 10-7 10-19 10S5 24 5 24Z" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M36 10l6-5m-3 10 6-1" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

export function WallPushIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} data-icon="wall-push-ups" fill="none" viewBox="0 0 48 48">
      <path d="M41 5v38M13 15l14 7 7-1M27 22l-5 9-10 10M22 31l10 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M34 17v8" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

export function WalkIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} data-icon="purposeful-walk" fill="none" viewBox="0 0 48 48">
      <circle cx="28" cy="8" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="m25 16-5 9 7 5 4-8m-4 8-4 12m4-12 9 10M20 25l-8 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M5 42h8m23 0h7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

export function QuietResetIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} data-icon="quiet-reset" fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="11" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24 17v12m0-6-8 7m8-7 8 7M16 30l-5 11m21-11 5 11M15 41h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M8 12c2-2 4-2 6 0m20 0c2-2 4-2 6 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}
