import { TextAttributes } from "@opentui/core";
import { useNavigation } from "../app/navigationContext";
import { useKeyboard } from "@opentui/react";

const ACTIONS = [
  { key: "s", label: "Search packages", screen: "search" as const },
  { key: "u", label: "Check for updates", screen: "update" as const },
  { key: "i", label: "Manage installed packages", screen: "installed" as const },
];

export function HomeScreen() {
  const { push } = useNavigation();

  useKeyboard((key) => {
    const action = ACTIONS.find((a) => a.key === key.name);
    if (action) push({ name: action.screen });
  });

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-start" borderStyle="single" title="baro" padding={2}>
        <text attributes={TextAttributes.BOLD}>baro — a TUI for paru</text>
        <text attributes={TextAttributes.DIM}> </text>
        {ACTIONS.map((a) => (
          <text key={a.key}>
            [{a.key}] {a.label}
          </text>
        ))}
        <text attributes={TextAttributes.DIM}> </text>
        <text attributes={TextAttributes.DIM}>Press ? for help, q to quit</text>
      </box>
    </box>
  );
}
