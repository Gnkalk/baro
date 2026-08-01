import { runParu } from "./process";
import {
  parseInfoBlock,
  parseInstalledList,
  parseOrphanList,
  parseSearchOutput,
  parseUpgradable,
} from "./parsers";
import type { Package, PackageInfo, UpgradeEntry } from "./types";

/** paru/pacman use grep-like exit semantics for query commands: nonzero exit with empty
 * stdout means "no results", not an error. Only throw when stderr has real content. */
function assertQueryOk(stdout: string, stderr: string, code: number) {
  if (code !== 0) {
    if (stderr.trim().length > 0) {
      throw new Error(stderr.trim());
    }
    const out = stdout.trim();
    if (out.toLowerCase().startsWith("error:")) {
      throw new Error(out.split("\n")[0]);
    }
  }
}

export async function searchPackages(query: string): Promise<Package[]> {
  const { stdout, stderr, code } = await runParu(["-Ss", query]);
  assertQueryOk(stdout, stderr, code);
  return parseSearchOutput(stdout);
}

export async function getPackageInfo(name: string, opts: { installed: boolean }): Promise<PackageInfo | null> {
  const { stdout, stderr, code } = await runParu([opts.installed ? "-Qi" : "-Si", name]);
  assertQueryOk(stdout, stderr, code);
  return parseInfoBlock(stdout);
}

export async function listUpgradable(): Promise<UpgradeEntry[]> {
  const { stdout, stderr, code } = await runParu(["-Qu"]);
  assertQueryOk(stdout, stderr, code);
  return parseUpgradable(stdout);
}

export async function listInstalled(): Promise<Array<{ name: string; version: string }>> {
  const { stdout, stderr, code } = await runParu(["-Q"]);
  assertQueryOk(stdout, stderr, code);
  return parseInstalledList(stdout);
}

export async function listOrphans(): Promise<string[]> {
  const { stdout, stderr, code } = await runParu(["-Qtdq"]);
  assertQueryOk(stdout, stderr, code);
  return parseOrphanList(stdout);
}

export async function getPkgbuild(name: string): Promise<string> {
  const { stdout, stderr, code } = await runParu(["-G", "--print", name]);
  assertQueryOk(stdout, stderr, code);
  return stdout;
}

export async function getParuVersion(): Promise<string> {
  const { stdout, stderr, code } = await runParu(["--version"]);
  assertQueryOk(stdout, stderr, code);
  return stdout.split("\n")[0]?.trim() ?? "unknown";
}
