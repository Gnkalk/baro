import { useEffect, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { usePackageCache } from "../app/packageCacheContext";
import { searchPackages } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { Package } from "../paru/types";
import { theme, screenAccent } from "../theme";

export function SearchScreen() {
  const { push } = useNavigation();
  const cache = usePackageCache();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusTarget, setFocusTarget] = useState<"input" | "list">("input");

  useKeyboard((key) => {
    if (key.name === "tab") setFocusTarget((t) => (t === "input" ? "list" : "input"));
    if (key.name === "return" && focusTarget === "input") setSubmitted(query);
  });

  const { data: results, loading, error } = useAsyncQuery<Package[]>(async () => {
    if (submitted.length === 0) return [];
    const cached = cache.searchResults.get(submitted);
    if (cached) return cached;
    const pkgs = await searchPackages(submitted);
    cache.searchResults.set(submitted, pkgs);
    return pkgs;
  }, [submitted]);

  useEffect(() => {
    if (results && results.length > 0) setFocusTarget("list");
  }, [results]);

  const options = (results ?? []).map((pkg) => ({
    name: `${pkg.installed ? "[installed] " : ""}${pkg.repo}/${pkg.name} ${pkg.version}`,
    description: pkg.description,
    value: pkg,
  }));
  const preview = (results ?? [])[selectedIndex];

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box borderStyle="single" borderColor={screenAccent.search} title="Search AUR & repos">
        <input
          placeholder="Type a package name and press Enter..."
          focused={focusTarget === "input"}
          value={query}
          onInput={setQuery}
        />
      </box>
      <box flexGrow={1} flexDirection="row" marginTop={1}>
        {loading && <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Searching...</text>}
        {error && <text fg={theme.semantic.error}>{`Error: ${error}`}</text>}
        {!loading && !error && submitted.length > 0 && options.length === 0 && (
          <text attributes={TextAttributes.DIM} fg={theme.text.dim}>No results for "{submitted}"</text>
        )}
        {options.length > 0 && (
          <box flexDirection="row" flexGrow={1}>
            <box flexGrow={1}>
              <select
                flexGrow={1}
                options={options}
                focused={focusTarget === "list"}
                showDescription={false}
                showScrollIndicator={true}
                selectedIndex={selectedIndex}
                selectedBackgroundColor={theme.bg.selected}
                selectedTextColor={theme.accent.primary}
                onChange={(index) => setSelectedIndex(index)}
                onSelect={(_index, option) => {
                  const pkg = option?.value as Package | undefined;
                  if (pkg) push({ name: "detail", pkg: { name: pkg.name, installed: pkg.installed } });
                }}
              />
            </box>
            <box
              width={36}
              marginLeft={1}
              borderStyle="single"
              borderColor={theme.border.default}
              backgroundColor={theme.bg.panel}
              title="Preview"
              padding={1}
              flexDirection="column"
            >
              {preview ? (
                <>
                  <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>
                    {preview.name}
                  </text>
                  <text fg={theme.accent.tertiary}>{preview.version}</text>
                  <text fg={preview.installed ? theme.semantic.success : theme.text.dim}>
                    {preview.installed ? `installed${preview.installedVersion ? ` (${preview.installedVersion})` : ""}` : "not installed"}
                  </text>
                  <text attributes={TextAttributes.DIM} fg={theme.text.dim}> </text>
                  <text fg={theme.text.body}>
                    {preview.description.length > 32 ? `${preview.description.slice(0, 31)}…` : preview.description}
                  </text>
                </>
              ) : (
                <text attributes={TextAttributes.DIM} fg={theme.text.dim}>No selection</text>
              )}
            </box>
          </box>
        )}
      </box>
      <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Enter: search/select · Tab: switch focus · Esc: back</text>
    </box>
  );
}
