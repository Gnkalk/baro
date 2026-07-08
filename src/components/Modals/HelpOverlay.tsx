import { TextAttributes } from "@opentui/core";
import { theme } from "../../theme";

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
  ["a", "Select all / remove all orphans / about (home)"],
  ["d", "Dashboard (home)"],
  ["s / u", "Search / Updates (home)"],
];

export function HelpOverlay() {
  return (
    <box position="absolute" top={2} left={4} right={4} bottom={2} zIndex={100} alignItems="center" justifyContent="center">
      <box borderStyle="double" borderColor={theme.border.accent} title="Keybindings" padding={2} backgroundColor={theme.bg.overlay}>
        {KEYS.map(([key, desc]) => (
          <box key={key} flexDirection="row" gap={2}>
            <box width={14}>
              <text attributes={TextAttributes.BOLD} fg={theme.accent.primary}>{key}</text>
            </box>
            <text fg={theme.text.body}>{desc}</text>
          </box>
        ))}
      </box>
    </box>
  );
}
