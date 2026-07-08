# 📦 baro

![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> [!WARNING]
> W.I.P: Work In Progress

_Project vibe coded by user._

**baro** (Persian: بارو, meaning *rampart* or *fortification wall*) is a fast, interactive terminal UI wrapper around the [`paru`](https://github.com/Morganamilo/paru) AUR helper. The name was chosen because it sounds like "paru" while symbolizing the defense of your system. Built with [Bun](https://bun.sh), [React](https://reactjs.org), and [OpenTUI](https://opentui.com), it brings a modern, visual experience to package management on Arch-based distributions.

---

## ❓ Why baro?

While `paru` is incredibly powerful, parsing complex terminal outputs and PKGBUILDs in a raw terminal can sometimes be visually overwhelming. `baro` wraps `paru` in an intuitive, keyboard-driven interface that allows you to:
- Visually inspect packages, dependencies, and conflicts before installation.
- Manage system updates with clear, selectable lists.
- Avoid typing long CLI commands to manage your cache, orphans, and installed software.

---

## ✨ Features

- **🔍 Advanced Search:** Easily search both the AUR and official repositories. View detailed package metadata at a glance.
- **📦 Seamless Installation:** Review native PKGBUILDs before building, ensuring safety and transparency.
- **🚀 System Updates:** View, select, and upgrade specific packages, or effortlessly upgrade your entire system.
- **🧹 Package Management:** Full control over your installed packages. Remove software, list/clean orphan dependencies, and clear out the package cache.
- **🛡️ Native Prompts:** All interactive `paru` prompts (sudo passwords, GPG key imports, conflict selections) are gracefully reimplemented as native TUI dialogs. *Security first: your sudo password is masked and never logged or rendered on screen.*

---

## 🖥️ User Interface

`baro` is divided into three main screens, quickly accessible via home screen shortcuts:
1. **Search (<kbd>s</kbd>)**: Type a query to find packages in AUR and official repos. Press <kbd>Enter</kbd> to see package details and <kbd>i</kbd> to install.
2. **Updates (<kbd>u</kbd>)**: See all available upgrades. Use <kbd>Space</kbd> to toggle selections, or <kbd>a</kbd> to select all, then <kbd>Enter</kbd> to upgrade.
3. **Installed (<kbd>i</kbd>)**: Browse everything installed on your system. Remove packages (<kbd>r</kbd>), clean orphans (<kbd>a</kbd>), or clear `paru` cache (<kbd>c</kbd>).

---

## ⚙️ Requirements

Ensure you have the following installed before proceeding:
- [Bun](https://bun.sh) (JavaScript runtime)
- [`paru`](https://github.com/Morganamilo/paru) (Must be installed and available on your `$PATH`)
- Arch Linux (or an Arch-based distribution)

---

## 🚀 Getting Started

To get `baro` up and running locally, clone the repository and run the dev server:

```bash
git clone https://github.com/yourusername/baro.git
cd baro
bun install
bun dev
```

---

## ⌨️ Keybindings

Master `baro` with these intuitive keybindings:

| Key | Action |
| --- | --- |
| <kbd>q</kbd> / <kbd>Ctrl</kbd>+<kbd>C</kbd> | Quit application |
| <kbd>Esc</kbd> | Go back / Cancel current action |
| <kbd>/</kbd> | Quick jump to search (from anywhere) |
| <kbd>Tab</kbd> | Switch focus between panes |
| <kbd>?</kbd> | Toggle help overlay |
| <kbd>Up</kbd> / <kbd>Down</kbd> | Navigate lists |
| <kbd>Space</kbd> | Toggle selection (on update screen) |
| <kbd>Enter</kbd> | Confirm / Select / Submit |
| <kbd>s</kbd> / <kbd>u</kbd> / <kbd>i</kbd> | Quick jump: **S**earch / **U**pdates / **I**nstalled (from home) |
| <kbd>i</kbd> | **I**nstall (from package detail screen) |
| <kbd>r</kbd> | **R**emove selected package |
| <kbd>c</kbd> | **C**lean package cache (from installed screen) |
| <kbd>a</kbd> | Select **a**ll upgrades / Remove **a**ll orphans |

---

## 🏗️ Architecture

Under the hood, `baro` is cleanly structured to separate UI from package management logic:

- `src/paru/` — Core interaction with `paru` (process spawning, output parsing, prompt detection).
- `src/app/` — Global React contexts (navigation, focus, package cache).
- `src/hooks/` — Custom hooks like `useParuOperation` (drives paru operations + prompts), `useAsyncQuery`, and `useGlobalKeys`.
- `src/screens/` — Top-level screen components.
- `src/components/` — Reusable UI elements (modals, log viewer).

---

## 🧪 Testing

We use Bun's built-in test runner. Parser and prompt-detection logic is covered by robust, fixture-based tests using real captured `paru` output.

```bash
bun test
```

---

## ⚠️ Known Limitations

Since `paru` lacks a machine-readable output format, `baro` relies on line-based regex parsing for its human-oriented text (located in `src/paru/parsers.ts`). 
- **Graceful Degradation:** Unparsed lines will not crash the app, but instead degrade gracefully.
- **Maintenance:** A major `paru` update that alters output formatting might require regex adjustments.

---

## 🤝 Contributing

Contributions are welcome! If you find a bug in `paru` output parsing or want to add a feature:
1. Fork the repo.
2. Create a new branch.
3. Submit a pull request.
If adding parser logic, please add a corresponding test fixture in `tests/`.
