import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { usePackageCache } from "../app/packageCacheContext";
import { getPackageInfo } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { PackageInfo } from "../paru/types";
import { theme, screenAccent } from "../theme";

export function PackageDetailScreen({ pkg }: { pkg: { name: string; installed: boolean } }) {
  const cache = usePackageCache();
  const { push } = useNavigation();

  useKeyboard((key) => {
    if (key.name === "i" && !pkg.installed) push({ name: "pkgbuildReview", pkgNames: [pkg.name] });
    if (key.name === "r" && pkg.installed) push({ name: "operationLog", op: "remove", targets: [pkg.name] });
  });

  const cacheKey = `${pkg.installed ? "Q" : "S"}:${pkg.name}`;
  const { data: info, loading, error } = useAsyncQuery<PackageInfo | null>(async () => {
    const cached = cache.packageInfo.get(cacheKey);
    if (cached !== undefined) return cached;
    const result = await getPackageInfo(pkg.name, { installed: pkg.installed });
    cache.packageInfo.set(cacheKey, result);
    return result;
  }, [cacheKey]);

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box borderStyle="single" borderColor={screenAccent.detail} title={pkg.name} flexGrow={1} flexDirection="column" padding={1}>
        {loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Loading...</text>}
        {error && <text fg={theme.semantic.error}>{`Error: ${error}`}</text>}
        {info?.fields.map((field, i) => (
          <box key={`${field.key}-${i}`} flexDirection="row">
            <box width={18}>
              <text attributes={TextAttributes.BOLD} fg={theme.accent.secondary}>{field.key}</text>
            </box>
            <box flexDirection="column">
              {field.values.length === 0 ? (
                <text attributes={TextAttributes.DIM} fg={theme.text.dim}>None</text>
              ) : (
                field.values.map((v, j) => <text key={j} fg={theme.text.body}>{v}</text>)
              )}
            </box>
          </box>
        ))}
      </box>
      <text attributes={TextAttributes.DIM} fg={theme.text.dim}>
        {pkg.installed ? "r: remove" : "i: install"} · Esc: back
      </text>
    </box>
  );
}
