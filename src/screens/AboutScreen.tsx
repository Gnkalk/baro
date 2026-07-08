import { TextAttributes } from "@opentui/core";
import { getParuVersion } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import { theme, screenAccent } from "../theme";

const KEYS: Array<[string, string]> = [
  ["s", "Search packages"],
  ["u", "Check for updates"],
  ["i", "Manage installed packages"],
  ["d", "Dashboard"],
  ["?", "Help"],
  ["q", "Quit"],
];

export function AboutScreen() {
  const { data: paruVersion, loading } = useAsyncQuery<string>(() => getParuVersion(), []);

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box borderStyle="single" borderColor={screenAccent.about} title="About" flexGrow={1} flexDirection="column" padding={2}>
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>baro — a TUI for paru</text>
        <text fg={theme.text.body}>{loading ? "Checking paru version..." : paruVersion}</text>
        <text attributes={TextAttributes.DIM} fg={theme.text.dim}> </text>
        <text attributes={TextAttributes.BOLD} fg={theme.accent.secondary}>Keybindings</text>
        {KEYS.map(([key, desc]) => (
          <box key={key} flexDirection="row" gap={2}>
            <box width={10}>
              <text attributes={TextAttributes.BOLD} fg={theme.accent.primary}>{key}</text>
            </box>
            <text fg={theme.text.body}>{desc}</text>
          </box>
        ))}
      </box>
      <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Esc: back</text>
    </box>
  );
}
