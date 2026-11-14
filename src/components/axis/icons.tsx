import type { FC, ReactNode } from "react";

/**
 * Inline stroke icons for the Axis app previews. Thin wrappers around simple
 * SVGs in the style of lucide (the icon set the live app uses) — small enough
 * to render crisply at 16px inside sidebar rows and buttons.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Svg({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true" {...base}>
      {children}
    </svg>
  );
}

export const AxIcon = {
  layout: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  ),
  clients: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M3 21v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
      <circle cx="8" cy="7" r="3" />
      <path d="M17 11a3 3 0 1 0 0-6" />
      <path d="M21 21v-1a3.5 3.5 0 0 0-3-3.4" />
    </Svg>
  ),
  file: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  ),
  package: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </Svg>
  ),
  truck: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <rect x="2" y="7" width="13" height="9" rx="1.5" />
      <path d="M15 9.5h3.2l2.8 3v3.5H15z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </Svg>
  ),
  receipt: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </Svg>
  ),
  bag: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M6 8h12l-1 12a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 20z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Svg>
  ),
  wallet: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M20 7H5a2 2 0 0 1 0-4h13v4" />
      <path d="M4 5v13a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" />
      <circle cx="16" cy="13" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  book: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />
      <path d="M20 17v3" />
    </Svg>
  ),
  sheet: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M5 3h14v18H5z" />
      <path d="M9 3v18M5 8h4M9 14h10M9 18h10" />
    </Svg>
  ),
  chart: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
    </Svg>
  ),
  card: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6 15h4" />
    </Svg>
  ),
  trend: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  ),
  percent: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M19 5L5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </Svg>
  ),
  users: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M17.8 14a6.5 6.5 0 0 1 3.7 6" />
    </Svg>
  ),
  userCog: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M3.5 20a6.5 6.5 0 0 1 9.5-5.6" />
      <circle cx="17.5" cy="17" r="2.6" />
      <path d="M17.5 12.9v1.6M17.5 19.5v1.6M13.3 17h1.6M20.1 17h1.6M14.7 14.3l1.2 1.1M19.2 18.6l1.2 1.1M20.3 14.3l-1.2 1.1M15.8 18.6l-1.2 1.1" />
    </Svg>
  ),
  settings: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8l1.7 1.1 2.3-.4 1 2 2.2.8-.5 2.2 1.2 1.9-1.2 1.9.5 2.3-2.2.7-1 2.1-2.3-.5-1.7 1.2-1.7-1.2-2.3.5-1-2.1-2.2-.7.5-2.3-1.2-1.9 1.2-1.9-.5-2.2 2.2-.8 1-2 2.3.4z" />
    </Svg>
  ),
  plug: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-3.5 5.5L13 18a2 2 0 0 1-2 0l-1.5-1.5A6 6 0 0 1 6 11z" />
      <path d="M12 19v2" />
    </Svg>
  ),
  search: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Svg>
  ),
  bell: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  ),
  chevron: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  ),
  check: ({ size = 14 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Svg>
  ),
  plus: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  download: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M12 3v11M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </Svg>
  ),
  filter: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M4 5h16l-6 7v5.5L10 19v-7z" />
    </Svg>
  ),
  arrowUp: ({ size = 14 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Svg>
  ),
  logOut: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  ),
  help: ({ size = 16 }: { size?: number }) => (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.2a2.8 2.8 0 1 1 3.9 3.2c-.7.4-1.1 1-1.1 1.6" />
      <circle cx="12" cy="17" r="0.4" fill="currentColor" />
    </Svg>
  ),
} satisfies Record<string, FC<{ size?: number }>>;
