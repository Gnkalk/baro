import { useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { listInstalled, listOrphans } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";

type Tab = "installed" | "orphans";

export function InstalledScreen() {
  const { push } = useNavigation();
  const [tab, setTab] = useState<Tab>("installed");
  const [cursor, setCursor] = useState(0);

  const installedQuery = useAsyncQuery<Array<{ name: string; version: string }>>(() => listInstalled(), []);
  const orphansQuery = useAsyncQuery<string[]>(() => listOrphans(), []);

  const list = tab === "installed" ? (installedQuery.data ?? []) : (orphansQuery.data ?? []).map((name) => ({ name, version: "" }));
  const loading = tab === "installed" ? installedQuery.loading : orphansQuery.loading;
  const error = tab === "installed" ? installedQuery.error : orphansQuery.error;

  useKeyboard((key) => {
    if (key.name === "tab") {
      setTab((t) => (t === "installed" ? "orphans" : "installed"));
      setCursor(0);
      return;
    }
    if (loading || list.length === 0) return;
    if (key.name === "down") setCursor((c) => Math.min(c + 1, list.length - 1));
    if (key.name === "up") setCursor((c) => Math.max(c - 1, 0));
    if (key.name === "r") {
      const target = list[cursor];
      if (target) push({ name: "operationLog", op: tab === "orphans" ? "removeOrphans" : "remove", targets: [target.name] });
    }
    if (key.name === "c" && tab === "installed") {
      push({ name: "operationLog", op: "cleanCache", targets: [] });
    }
    if (key.name === "a" && tab === "orphans" && list.length > 0) {
      push({ name: "operationLog", op: "removeOrphans", targets: list.map((p) => p.name) });
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box borderStyle="single" title={tab === "installed" ? "Installed packages" : "Orphaned packages"} flexGrow={1} flexDirection="column" padding={1}>
        {loading && <text attributes={TextAttributes.DIM}>Loading...</text>}
        {error && <text fg="red">Error: {error}</text>}
        {!loading && !error && list.length === 0 && (
          <text attributes={TextAttributes.DIM}>{tab === "installed" ? "No packages found." : "No orphaned packages."}</text>
        )}
        {list.map((pkg, i) => (
          <text key={pkg.name} attributes={i === cursor ? TextAttributes.BOLD : undefined}>
            {pkg.name} {pkg.version}
          </text>
        ))}
      </box>
      <text attributes={TextAttributes.DIM}>
        Tab: switch installed/orphans · Up/Down: move · r: remove selected
        {tab === "orphans" ? " · a: remove all orphans" : " · c: clean cache"} · Esc: back
      </text>
    </box>
  );
}
