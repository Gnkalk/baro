import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { listUpgradable, listOrphans } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { UpgradeEntry } from "../paru/types";
import { theme, screenAccent } from "../theme";

export function StatusScreen() {
  const { push } = useNavigation();
  const updates = useAsyncQuery<UpgradeEntry[]>(() => listUpgradable(), []);
  const orphans = useAsyncQuery<string[]>(() => listOrphans(), []);

  useKeyboard((key) => {
    if (key.name === "u") push({ name: "update" });
    if (key.name === "i") push({ name: "installed" });
  });

  const updateCount = updates.data?.length ?? 0;
  const orphanCount = orphans.data?.length ?? 0;
  const loading = updates.loading || orphans.loading;

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box borderStyle="single" borderColor={screenAccent.status} title="Dashboard" flexGrow={1} flexDirection="column" padding={2}>
        {loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Checking system status...</text>}
        {!loading && (
          <>
            <box flexDirection="row" gap={2}>
              <text attributes={TextAttributes.BOLD} fg={updateCount > 0 ? theme.accent.tertiary : theme.semantic.success}>
                {updateCount > 0 ? `${updateCount} update${updateCount === 1 ? "" : "s"} available` : "System is up to date"}
              </text>
            </box>
            <box flexDirection="row" gap={2}>
              <text attributes={TextAttributes.BOLD} fg={orphanCount > 0 ? theme.accent.tertiary : theme.semantic.success}>
                {orphanCount > 0 ? `${orphanCount} orphaned package${orphanCount === 1 ? "" : "s"}` : "No orphaned packages"}
              </text>
            </box>
            <text attributes={TextAttributes.DIM} fg={theme.text.dim}> </text>
            <text fg={theme.text.body}>u: go to updates · i: go to installed/orphans</text>
          </>
        )}
      </box>
      <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Esc: back</text>
    </box>
  );
}
