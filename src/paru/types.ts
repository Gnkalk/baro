export interface Package {
  repo: string;
  name: string;
  version: string;
  installed: boolean;
  installedVersion?: string;
  description: string;
}

export interface PackageInfo {
  name: string;
  fields: Array<{ key: string; values: string[] }>;
}

export interface UpgradeEntry {
  name: string;
  oldVersion: string;
  newVersion: string;
}

export type OperationKind = "install" | "remove" | "sysUpgrade" | "cleanCache" | "removeOrphans";

export type OperationEvent =
  | { type: "log"; line: string; offset?: number }
  | { type: "prompt:sudo" }
  | { type: "prompt:gpg"; key: string }
  | { type: "prompt:provider"; question: string; options: string[] }
  | { type: "prompt:generic"; question: string }
  | { type: "done"; code: number }
  | { type: "error"; message: string };

export type PromptMatch =
  | { type: "sudo" }
  | { type: "gpg"; key: string }
  | { type: "provider"; question: string; options: string[] }
  | { type: "generic"; question: string };
