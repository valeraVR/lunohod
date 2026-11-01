import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconCrescent({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...props}>
      <path
        d="M16.7 3.4A9.2 9.2 0 1 0 20.6 16a7.3 7.3 0 0 1-4-12.6Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M17.8 6.1c.2 1.7 1.6 3.1 3.4 3.3-1.8.2-3.2 1.6-3.4 3.3-.2-1.7-1.6-3.1-3.4-3.3 1.8-.2 3.2-1.6 3.4-3.3Z"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  );
}

export function IconStar({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden {...props}>
      <path d="M12 1.6c.62 5.63 4.77 9.78 10.4 10.4-5.63.62-9.78 4.77-10.4 10.4-.62-5.63-4.77-9.78-10.4-10.4C7.23 11.38 11.38 7.23 12 1.6Z" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function IconShard({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden {...props}>
      <path
        d="M12 1.8 19 9l-7 13.2L5 9l7-7.2Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="m5 9 7 3 7-3M12 1.8V12m0 0v10.2" stroke="currentColor" strokeWidth="1.15" opacity="0.8" />
    </svg>
  );
}

export function IconSound({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M4 9.5h3l4-3.4v11.8l-4-3.4H4z" />
      <path d="M15 9a4.4 4.4 0 0 1 0 6" />
      <path d="M17.7 6.4a8 8 0 0 1 0 11.2" opacity="0.65" />
    </svg>
  );
}

export function IconMuted({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M4 9.5h3l4-3.4v11.8l-4-3.4H4z" />
      <path d="m15.5 9.5 4.5 5M20 9.5l-4.5 5" />
    </svg>
  );
}

export function IconPause({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <rect x="7" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlay({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M8 5.4v13.2L18.5 12 8 5.4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconRestart({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 3.8V9h-5.2" />
    </svg>
  );
}

export function IconHome({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

export function IconBook({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M4 5.2c2.6-1 5.3-1 8 .6v13.4c-2.7-1.6-5.4-1.6-8-.6V5.2Z" />
      <path d="M20 5.2c-2.6-1-5.3-1-8 .6v13.4c2.7-1.6 5.4-1.6 8-.6V5.2Z" />
    </svg>
  );
}

export function IconTrophy({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M8 4h8v4.2a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.4H5v1.8A3.2 3.2 0 0 0 8.2 10M16 5.4h3v1.8A3.2 3.2 0 0 1 15.8 10" />
      <path d="M12 12.2V16M8.5 20h7M10 16h4l.8 4H9.2l.8-4Z" />
    </svg>
  );
}

export function IconHourglass({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M6 3.5h12M6 20.5h12" />
      <path d="M7.5 3.5c0 4 4.5 5.7 4.5 8.5 0-2.8 4.5-4.5 4.5-8.5M7.5 20.5c0-4 4.5-5.7 4.5-8.5 0 2.8 4.5 4.5 4.5 8.5" />
    </svg>
  );
}

export function IconClose({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconChevron({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function IconArrow({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...props}>
      <path d="M12 3.6 20 15h-5.2v5.4H9.2V15H4l8-11.4Z" />
    </svg>
  );
}

export function IconEye({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconSparkle({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} {...props}>
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function IconInfinity({ className, ...props }: IconProps) {
  return (
    <svg {...base} className={className} {...props}>
      <path d="M8.2 8.4c-2.4 0-4.2 1.6-4.2 3.6s1.8 3.6 4.2 3.6c3.6 0 4-7.2 7.6-7.2 2.4 0 4.2 1.6 4.2 3.6s-1.8 3.6-4.2 3.6c-3.6 0-4-7.2-7.6-7.2Z" />
    </svg>
  );
}

export function CornerFlourish({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden className={className} {...props}>
      <path d="M2 58V22C2 10.4 10.4 2 22 2h36" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path d="M8 58V24C8 15.2 15.2 8 24 8h34" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
      <path d="M14 22c0-4.4 3.6-8 8-8" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
      <path d="M20 16.5c2.2-1.4 4.4-.7 5.4 1.1" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      <circle cx="22" cy="22" r="1.7" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function Ornament({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 120 16" fill="none" aria-hidden className={className} {...props}>
      <path d="M0 8h42" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M78 8h42" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M60 1.5 64 8l-4 6.5L56 8l4-6.5Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="48" cy="8" r="1.4" fill="currentColor" opacity="0.8" />
      <circle cx="72" cy="8" r="1.4" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
