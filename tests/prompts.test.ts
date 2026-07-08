import { describe, expect, test } from "bun:test";
import { matchPrompt } from "../src/paru/prompts";

describe("matchPrompt", () => {
  test("detects sudo password prompt", () => {
    const match = matchPrompt("some build output\n[sudo] password for gnkalk: ");
    expect(match).toEqual({ type: "sudo" });
  });

  test("detects GPG key import prompt", () => {
    const match = matchPrompt(":: Import PGP key 0x12345678, \"Someone <a@b.com>\"? [Y/n] ");
    expect(match?.type).toBe("gpg");
  });

  test("detects provider selection prompt", () => {
    const tail = [
      ":: There are 2 providers available for foo",
      ":: Repository extra",
      "  1) foo-a",
      "  2) foo-b",
      "Enter a number (default=1): ",
    ].join("\n");
    const match = matchPrompt(tail);
    expect(match).toEqual({ type: "provider", question: "Select a provider", options: ["foo-a", "foo-b"] });
  });

  test("falls back to generic yes/no prompt", () => {
    const match = matchPrompt(":: pkg conflicts with x. Remove x? [y/N] ");
    expect(match?.type).toBe("generic");
  });

  test("returns null for plain log lines", () => {
    expect(matchPrompt("downloading foo-1.0.pkg.tar.zst...")).toBeNull();
  });
});
