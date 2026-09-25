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
