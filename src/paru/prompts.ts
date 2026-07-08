import type { PromptMatch } from "./types";

const SUDO_RE = /\[sudo\] password for .*:\s*$/;
const GPG_IMPORT_RE = /Import PGP key.*\[Y\/n\]\s*$/i;
const YES_NO_RE = /\[Y\/n\]\s*$/i;
const PROVIDER_HEADER_RE = /:: There are (\d+) providers available for/i;
const NUMBERED_OPTION_RE = /^\s*(\d+)\)\s*(.+)$/;

/**
 * Detects a prompt paru/sudo is waiting on, given the tail of buffered output
 * (last handful of lines from stdout+stderr combined, most recent last).
 */
export function matchPrompt(bufferedTail: string): PromptMatch | null {
  const lines = bufferedTail.split("\n").filter((l) => l.length > 0);
  const lastLine = lines[lines.length - 1] ?? "";

  if (SUDO_RE.test(lastLine)) {
    return { type: "sudo" };
  }

  if (GPG_IMPORT_RE.test(lastLine)) {
    const keyLine = lines.find((l) => /key\s+[A-F0-9]{8,}/i.test(l));
    const keyMatch = keyLine ? /([A-F0-9]{8,})/i.exec(keyLine) : null;
    return { type: "gpg", key: keyMatch?.[1] ?? "unknown" };
  }

  if (PROVIDER_HEADER_RE.test(lines.join("\n"))) {
    const options: string[] = [];
    for (const line of lines) {
      const m = NUMBERED_OPTION_RE.exec(line);
      if (m) options.push(m[2] ?? "");
    }
    if (options.length > 0 && /Enter a number/i.test(lastLine)) {
      return { type: "provider", question: "Select a provider", options };
    }
  }

  if (YES_NO_RE.test(lastLine)) {
    return { type: "generic", question: lastLine.trim() };
  }

  return null;
}
