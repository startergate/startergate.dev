// 시안(docs/design/Main.dc.html)의 인라인 SVG를 그대로 옮긴 작은 아이콘 모음.
// 외부 아이콘 패키지 대신 필요한 만큼만 둔다 (AGENTS.md: 새 의존성은 꼭 필요한 것만).

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function FlagKR({ className }: { className?: string }) {
  // 태극기 공식 비율 그대로(Wikimedia Commons Flag_of_South_Korea.svg
  // 좌표를 그대로 옮겼다 — 손으로 만든 버전은 괘 모양이 실제와 달라서
  // 검증된 원본으로 교체했다).
  return (
    <svg
      className={className}
      width="22"
      height="15"
      viewBox="-72 -48 144 96"
      aria-hidden="true"
    >
      <rect x="-72" y="-48" width="144" height="96" fill="#FFFFFF" />
      <g stroke="#000000" strokeWidth="4">
        <path
          transform="rotate(33.69006752598)"
          d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"
        />
        <path
          transform="rotate(-33.69006752598)"
          d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"
        />
      </g>
      <g transform="rotate(33.69006752598)">
        <path fill="#CD2E3A" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" />
        <path fill="#0047A0" d="M-24 0a24 24 0 1048 0A12 12 0 100 0a12 12 0 11-24 0" />
      </g>
    </svg>
  );
}

export function FlagUS({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="15"
      viewBox="0 0 30 20"
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#FFFFFF" />
      <g fill="#B22234">
        <rect y="0" width="30" height="1.54" />
        <rect y="3.08" width="30" height="1.54" />
        <rect y="6.15" width="30" height="1.54" />
        <rect y="9.23" width="30" height="1.54" />
        <rect y="12.31" width="30" height="1.54" />
        <rect y="15.38" width="30" height="1.54" />
        <rect y="18.46" width="30" height="1.54" />
      </g>
      <rect width="12" height="10.77" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        <circle cx="2" cy="1.8" r="0.45" />
        <circle cx="5" cy="1.8" r="0.45" />
        <circle cx="8" cy="1.8" r="0.45" />
        <circle cx="10.5" cy="1.8" r="0.45" />
        <circle cx="3.5" cy="4" r="0.45" />
        <circle cx="6.5" cy="4" r="0.45" />
        <circle cx="9.3" cy="4" r="0.45" />
        <circle cx="2" cy="6.2" r="0.45" />
        <circle cx="5" cy="6.2" r="0.45" />
        <circle cx="8" cy="6.2" r="0.45" />
        <circle cx="10.5" cy="6.2" r="0.45" />
        <circle cx="3.5" cy="8.6" r="0.45" />
        <circle cx="6.5" cy="8.6" r="0.45" />
        <circle cx="9.3" cy="8.6" r="0.45" />
      </g>
    </svg>
  );
}

export function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function CopyLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
