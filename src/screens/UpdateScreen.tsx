import { useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { usePackageCache } from "../app/packageCacheContext";
import { listUpgradable, getPackageInfo } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { UpgradeEntry } from "../paru/types";
import { theme, screenAccent } from "../theme";

export function UpdateScreen() {
  const { push } = useNavigation();
  const cache = usePackageCache();
  const { data: entries, loading, error, reload } = useAsyncQuery<UpgradeEntry[]>(() => listUpgradable(), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);

  const list = entries ?? [];
  const selectedEntry = list[cursor];

  const preview = useAsyncQuery(async () => {
    if (!selectedEntry) return null;
    const cacheKey = `Q:${selectedEntry.name}`;
    const cached = cache.packageInfo.get(cacheKey);
    if (cached !== undefined) return cached;
    const result = await getPackageInfo(selectedEntry.name, { installed: true });
    cache.packageInfo.set(cacheKey, result);
    return result;
  }, [selectedEntry?.name]);

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
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box flexGrow={1} flexDirection="row">
        <scrollbox
          borderStyle="single"
          borderColor={screenAccent.update}
          title="Upgradable packages"
          flexGrow={1}
          rootOptions={{ backgroundColor: theme.bg.base }}
          padding={1}
          focused={false}
        >
          {loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Checking for updates...</text>}
          {error && <text fg={theme.semantic.error}>{`Error: ${error}`}</text>}
          {!loading && !error && list.length === 0 && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>System is up to date.</text>}
          {list.map((entry, i) => (
            <text key={entry.name} attributes={i === cursor ? TextAttributes.BOLD : undefined} fg={i === cursor ? theme.accent.primary : theme.text.body}>
              {`[${selected.has(entry.name) ? "x" : " "}] ${entry.name} ${entry.oldVersion} -> ${entry.newVersion}`}
            </text>
          ))}
        </scrollbox>
        <scrollbox
          width={36}
          marginLeft={1}
          borderStyle="single"
          borderColor={theme.border.default}
          rootOptions={{ backgroundColor: theme.bg.panel }}
          title="Preview"
          padding={1}
          focused={false}
        >
          {!selectedEntry && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>No selection</text>}
          {selectedEntry && preview.loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Loading...</text>}
          {selectedEntry && preview.data?.fields.map((field, i) => (
            <box key={`${field.key}-${i}`} flexDirection="row">
              <box width={14}>
                <text attributes={TextAttributes.BOLD} fg={theme.accent.tertiary}>{field.key}</text>
              </box>
              <box flexDirection="column" flexGrow={1} flexShrink={1}>
                {field.values.length === 0 ? (
                  <text attributes={TextAttributes.DIM} fg={theme.text.dim}>None</text>
                ) : (
                  field.values.map((v, j) => (
                    <text key={j} fg={theme.text.body}>{v.length > 20 ? `${v.slice(0, 19)}…` : v}</text>
                  ))
                )}
              </box>
            </box>
          ))}
        </scrollbox>
      </box>
      <text attributes={TextAttributes.DIM} fg={theme.text.dim}>
        Up/Down: move · Space: toggle · a: select all · Enter: upgrade (selection or all) · r: refresh · Esc: back
      </text>
    </box>
  );
}
