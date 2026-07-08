import { TextAttributes } from "@opentui/core";

const KEYS: Array<[string, string]> = [
  ["q / Ctrl+C", "Quit"],
  ["Esc", "Back / cancel"],
  ["/", "Jump to search (from anywhere)"],
  ["Tab", "Switch focus between panes"],
  ["?", "Toggle this help"],
  ["Up/Down", "Move selection in lists"],
  ["Space", "Toggle selection (update screen)"],
  ["Enter", "Confirm / select / submit"],
  ["i", "Install (package detail) / installed packages (home)"],
  ["r", "Remove selected package"],
  ["c", "Clean package cache (installed screen)"],
  ["a", "Select all / remove all orphans"],
  ["s / u", "Search / Updates (home)"],
];

export function HelpOverlay() {
  return (
    <box position="absolute" top={2} left={4} right={4} bottom={2} zIndex={100} alignItems="center" justifyContent="center">
      <box borderStyle="double" title="Keybindings" padding={2} backgroundColor="#111111">
        {KEYS.map(([key, desc]) => (
          <box key={key} flexDirection="row" gap={2}>
            <box width={14}>
              <text attributes={TextAttributes.BOLD}>{key}</text>
            </box>
            <text>{desc}</text>
          </box>
        ))}
      </box>
    </box>
  );
}
