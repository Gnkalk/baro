import { TextAttributes } from "@opentui/core";
import { useNavigation } from "../app/navigationContext";
import { useKeyboard } from "@opentui/react";
import { theme, screenAccent } from "../theme";

const ACTIONS = [
  { key: "s", label: "Search packages", description: "Search AUR & repos", screen: "search" as const },
  { key: "u", label: "Check for updates", description: "List and install upgradable packages", screen: "update" as const },
  { key: "i", label: "Manage installed packages", description: "Browse installed & orphaned packages", screen: "installed" as const },
  { key: "d", label: "Dashboard", description: "System status at a glance", screen: "status" as const },
  { key: "a", label: "About", description: "Version info & keybindings", screen: "about" as const },
];

export function HomeScreen() {
  const { push } = useNavigation();

  useKeyboard((key) => {
    const action = ACTIONS.find((a) => a.key === key.name);
    if (action) push({ name: action.screen });
  });

  const options = ACTIONS.map((a) => ({
    name: `[${a.key}] ${a.label}`,
    description: a.description,
    value: a.screen,
  }));

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1} backgroundColor={theme.bg.base}>
      <box
        justifyContent="center"
        alignItems="stretch"
        borderStyle="single"
        borderColor={screenAccent.home}
        backgroundColor={theme.bg.panel}
        title="baro"
        padding={2}
      >
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>
          baro — a TUI for paru
        </text>
        <text attributes={TextAttributes.DIM} fg={theme.text.dim}> </text>
        <select
          width={44}
          height={ACTIONS.length * 2}
          options={options}
          focused={true}
          showDescription={true}
          selectedBackgroundColor={theme.bg.selected}
          selectedTextColor={theme.accent.primary}
          descriptionColor={theme.text.dim}
          onSelect={(_index, option) => {
            if (option?.value) push({ name: option.value as (typeof ACTIONS)[number]["screen"] });
          }}
        />
        <text attributes={TextAttributes.DIM} fg={theme.text.dim}> </text>
        <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Press ? for help, q to quit</text>
      </box>
    </box>
  );
}
