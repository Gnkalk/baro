import { spawnParu, type ParuProcessHandle } from "./process";
import { matchPrompt } from "./prompts";
import type { OperationEvent } from "./types";

const PROMPT_TAIL_LINES = 12;

export interface RunningOperation {
  handle: ParuProcessHandle;
  events: AsyncIterable<OperationEvent>;
  resolvePrompt: (answer: string) => void;
}

function buildArgs(kind: "install" | "remove" | "sysUpgrade" | "cleanCache" | "removeOrphans", targets: string[]): string[] {
  switch (kind) {
    case "install":
      return ["-S", "--skipreview", "--sudoflags=-S", ...targets];
    case "remove":
      return ["-R", "--sudoflags=-S", ...targets];
    case "sysUpgrade":
      return ["-Syu", "--skipreview", "--sudoflags=-S"];
    case "cleanCache":
      return ["-Sc", "--sudoflags=-S"];
    case "removeOrphans":
      return ["-Rns", "--sudoflags=-S", ...targets];
  }
}

/**
 * Runs a mutating paru operation, yielding log lines and pausing on detected prompts.
 * The consumer must call `resolvePrompt(answer)` to unblock the process after a
 * "prompt:*" event; the answer is written to the subprocess's stdin.
 */
export function runOperation(
  kind: "install" | "remove" | "sysUpgrade" | "cleanCache" | "removeOrphans",
  targets: string[],
): RunningOperation {
  const queue: OperationEvent[] = [];
  let wake: (() => void) | null = null;
  let done = false;
  let tail: string[] = [];
  let awaitingPrompt = false;

  const push = (event: OperationEvent) => {
    queue.push(event);
    wake?.();
  };

  const onLine = (line: string) => {
    push({ type: "log", line });
    tail = [...tail, line].slice(-PROMPT_TAIL_LINES);
    if (awaitingPrompt) return;
    const match = matchPrompt(tail.join("\n"));
    if (match) {
      awaitingPrompt = true;
      if (match.type === "sudo") push({ type: "prompt:sudo" });
      else if (match.type === "gpg") push({ type: "prompt:gpg", key: match.key });
      else if (match.type === "provider") push({ type: "prompt:provider", question: match.question, options: match.options });
      else push({ type: "prompt:generic", question: match.question });
    }
  };

  const handle = spawnParu(buildArgs(kind, targets), { onStdout: onLine, onStderr: onLine });

  handle.exited.then((code) => {
    push({ type: "done", code });
    done = true;
    wake?.();
  });

  const resolvePrompt = (answer: string) => {
    handle.writeStdin(`${answer}\n`);
    awaitingPrompt = false;
    tail = [];
  };

  const events: AsyncIterable<OperationEvent> = {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<OperationEvent>> {
          while (queue.length === 0 && !done) {
            await new Promise<void>((resolve) => {
              wake = resolve;
            });
          }
          if (queue.length > 0) {
            return { value: queue.shift() as OperationEvent, done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };

  return { handle, events, resolvePrompt };
}
