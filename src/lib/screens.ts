// Screenshot slots for the Axis module pages and the services page.
//
// Each entry is { src, alt, caption? } — the file lives in /public/screens/
// and the alt text is required (loaded eagerly on the hero slot, lazy
// everywhere else by ScreenshotFrame).
//
// Arrays are LEFT EMPTY until real screenshots are dropped in. When an array
// is empty nothing renders and the page layout is already complete — adding
// an entry here is the only step needed to show the screenshot.
//
// Conventions (see the SEO follow-up report for exact filenames and sizes):
//   MODULE_SCREENS[slug][0]        -> hero visual (right of the fold)
//   MODULE_SCREENS[slug][1..n]     -> feature-section rows, in order
//   SERVICES_SCREENS[0]            -> services page wide slot
export type Screen = {
  src: string
  alt: string
  caption?: string
  // Optional explicit dimensions passed to next/image; defaults are fine
  // (1200x675) but set them to match the real file to avoid a CLS jump.
  width?: number
  height?: number
}

export const MODULE_SCREENS: Record<string, Screen[]> = {
  invoicing: [],
  accounting: [],
  inventory: [],
  hr: [],
}

export const SERVICES_SCREENS: Screen[] = []
