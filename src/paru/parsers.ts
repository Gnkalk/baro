import type { Package, PackageInfo, UpgradeEntry } from "./types";

const SEARCH_HEADER_RE = /^(\S+)\/(\S+)\s+(\S+)/;

/** Parses `paru -Ss` output: paired header + indented description lines. */
export function parseSearchOutput(stdout: string): Package[] {
  const lines = stdout.split("\n");
  const packages: Package[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.length === 0 || /^\s/.test(line)) continue;
    
    const match = SEARCH_HEADER_RE.exec(line);
    if (!match) continue;
    const [, repo, name, version] = match;
    
    const installedMatch = /\[Installed(?::\s*([^\]]+))?\]/.exec(line);
    const installed = installedMatch !== null;
    const installedVersion = installedMatch ? (installedMatch[1] || version) : undefined;
    
    const descLine = lines[i + 1] ?? "";
    const description = /^\s/.test(descLine) ? descLine.trim() : "";
    packages.push({
      repo: repo ?? "",
      name: name ?? "",
      version: version ?? "",
      installed,
      installedVersion,
      description,
    });
  }
  return packages;
}

/** Parses `paru -Si`/`paru -Qi` "Key : value" blocks, with indented continuation lines. */
export function parseInfoBlock(stdout: string): PackageInfo | null {
  const lines = stdout.split("\n");
  const fields: Array<{ key: string; values: string[] }> = [];
  let name = "";
  for (const line of lines) {
    if (line.length === 0) continue;
    const kvMatch = /^(\S(?:.*?\S)?)\s{2,}:\s?(.*)$/.exec(line);
    if (kvMatch) {
      const key = kvMatch[1] ?? "";
      const value = kvMatch[2] ?? "";
      fields.push({ key, values: value.length > 0 ? [value] : [] });
      if (key === "Name") name = value;
    } else if (/^\s/.test(line) && fields.length > 0) {
      const last = fields[fields.length - 1];
      if (last) last.values.push(line.trim());
    }
  }
  if (fields.length === 0) return null;
  return { name, fields };
}

/** Parses `paru -Qu` output: "name old -> new" per line. Empty input means no updates available. */
export function parseUpgradable(stdout: string): UpgradeEntry[] {
  const entries: UpgradeEntry[] = [];
  for (const line of stdout.split("\n")) {
    const match = /^(\S+)\s+(\S+)\s+->\s+(\S+)/.exec(line);
    if (!match) continue;
    entries.push({ name: match[1] ?? "", oldVersion: match[2] ?? "", newVersion: match[3] ?? "" });
  }
  return entries;
}

/** Parses `paru -Q` output: "name version" per line. */
export function parseInstalledList(stdout: string): Array<{ name: string; version: string }> {
  const items: Array<{ name: string; version: string }> = [];
  for (const line of stdout.split("\n")) {
    const match = /^(\S+)\s+(\S+)/.exec(line);
    if (!match) continue;
    items.push({ name: match[1] ?? "", version: match[2] ?? "" });
  }
  return items;
}

/** Parses `paru -Qtdq` output: one orphan package name per line. */
export function parseOrphanList(stdout: string): string[] {
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
