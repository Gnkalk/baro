import { useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { listUpgradable } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { UpgradeEntry } from "../paru/types";

export function UpdateScreen() {
  const { push } = useNavigation();
  const { data: entries, loading, error, reload } = useAsyncQuery<UpgradeEntry[]>(() => listUpgradable(), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);

  const list = entries ?? [];

  useKeyboard((key) => {
    if (loading || list.length === 0) return;
    if (key.name === "down") setCursor((c) => Math.min(c + 1, list.length - 1));
    if (key.name === "up") setCursor((c) => Math.max(c - 1, 0));
    if (key.name === "space") {
      const name = list[cursor]?.name;
      if (!name) return;
      setSelected((s) => {
        const next = new Set(s);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    }
    if (key.name === "a") {
      setSelected((s) => (s.size === list.length ? new Set() : new Set(list.map((e) => e.name))));
    }
    if (key.name === "return") {
      if (selected.size > 0) {
        push({ name: "operationLog", op: "install", targets: Array.from(selected) });
      } else {
        push({ name: "operationLog", op: "sysUpgrade", targets: [] });
      }
    }
    if (key.name === "r") reload();
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box borderStyle="single" title="Upgradable packages" flexGrow={1} flexDirection="column" padding={1}>
        {loading && <text attributes={TextAttributes.DIM}>Checking for updates...</text>}
        {error && <text fg="red">Error: {error}</text>}
        {!loading && !error && list.length === 0 && <text attributes={TextAttributes.DIM}>System is up to date.</text>}
        {list.map((entry, i) => (
          <text key={entry.name} attributes={i === cursor ? TextAttributes.BOLD : undefined}>
            [{selected.has(entry.name) ? "x" : " "}] {entry.name} {entry.oldVersion} -&gt; {entry.newVersion}
          </text>
        ))}
      </box>
      <text attributes={TextAttributes.DIM}>
        Up/Down: move · Space: toggle · a: select all · Enter: upgrade (selection or all) · r: refresh · Esc: back
      </text>
    </box>
  );
}
