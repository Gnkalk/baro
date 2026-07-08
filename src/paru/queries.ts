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
function assertQueryOk(stderr: string, code: number) {
  if (code !== 0 && stderr.trim().length > 0) {
    throw new Error(stderr.trim());
  }
}

export async function searchPackages(query: string): Promise<Package[]> {
  const { stdout, stderr, code } = await runParu(["-Ss", query]);
  assertQueryOk(stderr, code);
  return parseSearchOutput(stdout);
}

export async function getPackageInfo(name: string, opts: { installed: boolean }): Promise<PackageInfo | null> {
  const { stdout, stderr, code } = await runParu([opts.installed ? "-Qi" : "-Si", name]);
  assertQueryOk(stderr, code);
  return parseInfoBlock(stdout);
}

export async function listUpgradable(): Promise<UpgradeEntry[]> {
  const { stdout, stderr, code } = await runParu(["-Qu"]);
  assertQueryOk(stderr, code);
  return parseUpgradable(stdout);
}

export async function listInstalled(): Promise<Array<{ name: string; version: string }>> {
  const { stdout, stderr, code } = await runParu(["-Q"]);
  assertQueryOk(stderr, code);
  return parseInstalledList(stdout);
}

export async function listOrphans(): Promise<string[]> {
  const { stdout, stderr, code } = await runParu(["-Qtdq"]);
  assertQueryOk(stderr, code);
  return parseOrphanList(stdout);
}

export async function getPkgbuild(name: string): Promise<string> {
  const { stdout, stderr, code } = await runParu(["-G", "--print", name]);
  assertQueryOk(stderr, code);
  return stdout;
}

export async function getParuVersion(): Promise<string> {
  const { stdout, stderr, code } = await runParu(["--version"]);
  assertQueryOk(stderr, code);
  return stdout.split("\n")[0]?.trim() ?? "unknown";
}
