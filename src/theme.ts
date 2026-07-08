export const theme = {
  bg: {
    base: "#0b0e14",
    panel: "#11151c",
    log: "#0a0e12",
    overlay: "#141821",
    selected: "#1f2937",
  },
  border: {
    default: "#3b4252",
    focus: "#7dd3fc",
    accent: "#c084fc",
  },
  accent: {
    primary: "#7dd3fc",
    secondary: "#c084fc",
    tertiary: "#fbbf24",
    quaternary: "#34d399",
  },
  semantic: {
    success: "#4ade80",
    error: "#f87171",
    warning: "#fbbf24",
    info: "#7dd3fc",
    muted: "#6b7280",
  },
  text: {
    heading: "#e2e8f0",
    body: "#cbd5e1",
    dim: "#64748b",
  },
} as const;

export const screenAccent = {
  home: theme.accent.primary,
  search: theme.accent.primary,
  detail: theme.accent.secondary,
  pkgbuildReview: theme.accent.secondary,
  update: theme.accent.tertiary,
  installed: theme.accent.quaternary,
  operationLog: theme.accent.secondary,
  status: theme.accent.primary,
  about: theme.accent.secondary,
} as const;
