import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseInfoBlock,
  parseInstalledList,
  parseOrphanList,
  parseSearchOutput,
  parseUpgradable,
} from "../src/paru/parsers";

const fixture = (name: string) => readFileSync(join(import.meta.dir, "fixtures", name), "utf8");

describe("parseSearchOutput", () => {
  test("parses repo/name/version/description pairs", () => {
    const pkgs = parseSearchOutput(fixture("ss-output.txt"));
    expect(pkgs.length).toBeGreaterThan(0);
    const firefox = pkgs.find((p) => p.name === "firefox");
    expect(firefox).toBeDefined();
    expect(firefox?.repo).toBe("extra");
    expect(firefox?.installed).toBe(true);
    expect(firefox?.installedVersion).toBe("151.0.3-1");
    expect(firefox?.description).toContain("Web Browser");
  });

  test("marks non-installed packages correctly", () => {
    const pkgs = parseSearchOutput(fixture("ss-output.txt"));
    const nonInstalled = pkgs.find((p) => !p.installed);
    expect(nonInstalled).toBeDefined();
    expect(nonInstalled?.installedVersion).toBeUndefined();
  });
});

describe("parseInfoBlock", () => {
  test("parses -Si block with single-line fields", () => {
    const info = parseInfoBlock(fixture("si-output.txt"));
    expect(info?.name).toBe("neovim");
    const url = info?.fields.find((f) => f.key === "URL");
    expect(url?.values[0]).toBe("https://neovim.io");
  });

  test("parses -Qi block with multi-value continuation lines", () => {
    const info = parseInfoBlock(fixture("qi-output.txt"));
    expect(info?.name).toBe("pacman");
    const optDeps = info?.fields.find((f) => f.key === "Optional Deps");
    expect(optDeps?.values.length).toBeGreaterThanOrEqual(2);
    const reason = info?.fields.find((f) => f.key === "Install Reason");
    expect(reason?.values[0]).toContain("dependency");
  });
});

describe("parseUpgradable", () => {
  test("parses name old -> new lines", () => {
    const entries = parseUpgradable(fixture("qu-output.txt"));
    expect(entries.length).toBeGreaterThan(0);
    const first = entries[0];
    expect(first?.name).toBe("abseil-cpp");
    expect(first?.oldVersion).toBe("20260107.1-1");
    expect(first?.newVersion).toBe("20260526.0-2");
  });

  test("returns empty array for empty input", () => {
    expect(parseUpgradable("")).toEqual([]);
  });
});

describe("parseInstalledList / parseOrphanList", () => {
  test("parses name/version pairs", () => {
    const items = parseInstalledList("pacman 7.1.0.r9.g54d9411-2\nbash 5.3-1\n");
    expect(items).toEqual([
      { name: "pacman", version: "7.1.0.r9.g54d9411-2" },
      { name: "bash", version: "5.3-1" },
    ]);
  });

  test("filters blank lines for orphans", () => {
    expect(parseOrphanList("foo\n\nbar\n")).toEqual(["foo", "bar"]);
    expect(parseOrphanList("")).toEqual([]);
  });
});
