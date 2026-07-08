import { useEffect, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { usePackageCache } from "../app/packageCacheContext";
import { searchPackages } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";
import type { Package } from "../paru/types";

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

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box borderStyle="single" title="Search AUR & repos">
        <input
          placeholder="Type a package name and press Enter..."
          focused={focusTarget === "input"}
          value={query}
          onInput={setQuery}
        />
      </box>
      <box flexGrow={1} marginTop={1}>
        {loading && <text attributes={TextAttributes.DIM}>Searching...</text>}
        {error && <text fg="red">Error: {error}</text>}
        {!loading && !error && submitted.length > 0 && options.length === 0 && (
          <text attributes={TextAttributes.DIM}>No results for "{submitted}"</text>
        )}
        {options.length > 0 && (
          <select
            options={options}
            focused={focusTarget === "list"}
            showDescription={true}
            showScrollIndicator={true}
            selectedIndex={selectedIndex}
            onChange={(index) => setSelectedIndex(index)}
            onSelect={(_index, option) => {
              const pkg = option?.value as Package | undefined;
              if (pkg) push({ name: "detail", pkg: { name: pkg.name, installed: pkg.installed } });
            }}
          />
        )}
      </box>
      <text attributes={TextAttributes.DIM}>Enter: search/select · Tab: switch focus · Esc: back</text>
    </box>
  );
}
