# baro

A terminal UI wrapper around the [`paru`](https://github.com/Morganamilo/paru) AUR helper, built with Bun + React + [OpenTUI](https://opentui.com).

## Requirements

- [Bun](https://bun.sh)
- `paru` installed and on `$PATH`

## Install & run

```bash
bun install
bun dev
```

## Features

- Search AUR and repo packages, view detailed package info
- Install packages with a native PKGBUILD review screen before building
- System update: view and select upgradable packages, or upgrade everything
- Manage installed packages: view, remove, list/clean orphans, clean package cache
- Interactive `paru` prompts (sudo password, GPG key import, provider/conflict
  selection) are reimplemented as native TUI dialogs — no raw terminal
  passthrough. The sudo password is masked and never rendered on screen or
  logged.

## Keybindings

| Key | Action |
| --- | --- |
| `q` / `Ctrl+C` | Quit |
| `Esc` | Back / cancel |
| `/` | Jump to search (from anywhere) |
| `Tab` | Switch focus between panes |
| `?` | Toggle help overlay |
| `Up`/`Down` | Move selection in lists |
| `Space` | Toggle selection (update screen) |
| `Enter` | Confirm / select / submit |
| `s` / `u` / `i` | Search / Updates / Installed (from home) |
| `i` | Install (package detail screen, for non-installed packages) |
| `r` | Remove selected package |
| `c` | Clean package cache (installed screen) |
| `a` | Select all upgrades / remove all orphans |

## Architecture

- `src/paru/` — process spawning, output parsing, and prompt-detection for `paru`
- `src/app/` — navigation, focus, and package-cache React contexts
- `src/hooks/` — `useParuOperation` (drives a running paru operation + prompts), `useAsyncQuery`, `useGlobalKeys`
- `src/screens/` — one component per app screen
- `src/components/` — reusable UI: modals, log viewer

## Testing

```bash
bun test
```

Parser and prompt-detection logic is covered by fixture-based tests in `tests/`,
using real captured `paru` output.

## Known limitations

`paru` has no machine-readable output flag, so all parsing is line-based/regex
against its human-oriented text (see `src/paru/parsers.ts`). A `paru` version
bump that changes output formatting may require updating these regexes.
Unparsed lines degrade gracefully rather than crashing the app.
