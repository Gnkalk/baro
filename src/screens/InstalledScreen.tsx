import { useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { usePackageCache } from "../app/packageCacheContext";
import { listInstalled, listOrphans, getPackageInfo } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import { theme, screenAccent } from "../theme";

type Tab = "installed" | "orphans";

export function InstalledScreen() {
  const { push } = useNavigation();
  const cache = usePackageCache();
  const [tab, setTab] = useState<Tab>("installed");
  const [cursor, setCursor] = useState(0);

  const installedQuery = useAsyncQuery<Array<{ name: string; version: string }>>(() => listInstalled(), []);
  const orphansQuery = useAsyncQuery<string[]>(() => listOrphans(), []);

  const list = tab === "installed" ? (installedQuery.data ?? []) : (orphansQuery.data ?? []).map((name) => ({ name, version: "" }));
  const loading = tab === "installed" ? installedQuery.loading : orphansQuery.loading;
  const error = tab === "installed" ? installedQuery.error : orphansQuery.error;
  const selectedName = list[cursor]?.name;

  const preview = useAsyncQuery(async () => {
    if (!selectedName) return null;
    const cacheKey = `Q:${selectedName}`;
    const cached = cache.packageInfo.get(cacheKey);
    if (cached !== undefined) return cached;
    const result = await getPackageInfo(selectedName, { installed: true });
    cache.packageInfo.set(cacheKey, result);
    return result;
  }, [selectedName]);

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

  const tabAccent = tab === "installed" ? theme.accent.quaternary : theme.accent.tertiary;

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box flexGrow={1} flexDirection="row">
        <scrollbox
          viewportCulling={true}
          borderStyle="single"
          borderColor={tabAccent}
          title={tab === "installed" ? "Installed packages" : "Orphaned packages"}
          flexGrow={1}
          rootOptions={{ backgroundColor: theme.bg.base }}
          padding={1}
          focused={false}
        >
          {loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Loading...</text>}
          {error && <text fg={theme.semantic.error}>{`Error: ${error}`}</text>}
          {!loading && !error && list.length === 0 && (
            <text attributes={TextAttributes.DIM} fg={theme.text.dim}>{tab === "installed" ? "No packages found." : "No orphaned packages."}</text>
          )}
          {list.map((pkg, i) => (
            <text key={pkg.name} attributes={i === cursor ? TextAttributes.BOLD : undefined} fg={i === cursor ? theme.accent.primary : theme.text.body}>
              {`${pkg.name} ${pkg.version}`}
            </text>
          ))}
        </scrollbox>
        <scrollbox
          viewportCulling={true}
          width={36}
          marginLeft={1}
          borderStyle="single"
          borderColor={theme.border.default}
          rootOptions={{ backgroundColor: theme.bg.panel }}
          title="Preview"
          padding={1}
          focused={false}
        >
          {!selectedName && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>No selection</text>}
          {selectedName && preview.loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Loading...</text>}
          {selectedName && preview.data?.fields.map((field, i) => (
            <box key={`${field.key}-${i}`} flexDirection="row">
              <box width={14}>
                <text attributes={TextAttributes.BOLD} fg={theme.accent.secondary}>{field.key}</text>
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
        Tab: switch installed/orphans · Up/Down: move · r: remove selected
        {tab === "orphans" ? " · a: remove all orphans" : " · c: clean cache"} · Esc: back
      </text>
    </box>
  );
}
