# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Terminal UI app built with OpenTUI (`@opentui/core` + `@opentui/react`), scaffolded via `bun create tui`. Runtime is Bun, not Node.

## Commands

```bash
bun install   # install deps
bun dev       # run app with watch mode (src/index.tsx)
```

No test suite, lint config, or build step currently exists.

## Architecture

Single-entry app: `src/index.tsx` creates an OpenTUI renderer and mounts a React tree via `createRoot(renderer).render(<App />)`.

OpenTUI provides custom JSX intrinsics for terminal rendering (`<box>`, `<text>`, `<ascii-font>`, etc.) instead of HTML elements — configured via `jsxImportSource: "@opentui/react"` in tsconfig.json. Layout uses flexbox-like props (`flexGrow`, `alignItems`, `justifyContent`).

TypeScript is strict (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` all on) with bundler module resolution — no emit, Bun handles execution directly from `.tsx`.
