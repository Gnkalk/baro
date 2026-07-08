import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { runOperation, type RunningOperation } from "../paru/operations";
import type { OperationEvent, OperationKind } from "../paru/types";

export type PendingPrompt =
  | { type: "sudo" }
  | { type: "gpg"; key: string }
  | { type: "provider"; question: string; options: string[] }
  | { type: "generic"; question: string };

interface OperationState {
  logs: string[];
  pendingPrompt: PendingPrompt | null;
  result: { code: number } | null;
  error: string | null;
}

export function useParuOperation(kind: OperationKind, targets: string[]) {
  const [state, setState] = useState<OperationState>({ logs: [], pendingPrompt: null, result: null, error: null });
  const opRef = useRef<RunningOperation | null>(null);

  useEffect(() => {
    const op = runOperation(kind, targets);
    opRef.current = op;
    let cancelled = false;

    (async () => {
      for await (const event of op.events) {
        if (cancelled) break;
        applyEvent(event, setState);
      }
    })();

    return () => {
      cancelled = true;
      if (op.handle.proc.exitCode === null) op.handle.proc.kill();
    };
    // kind/targets are fixed for the lifetime of this operation instance; a new
    // instance (new component mount) is used to start a different operation.
  }, []);

  const resolvePrompt = (answer: string) => {
    opRef.current?.resolvePrompt(answer);
    setState((s) => ({ ...s, pendingPrompt: null }));
  };

  return { ...state, resolvePrompt };
}

function applyEvent(event: OperationEvent, setState: Dispatch<SetStateAction<OperationState>>) {
  switch (event.type) {
    case "log":
      setState((s) => ({ ...s, logs: [...s.logs, event.line] }));
      break;
    case "prompt:sudo":
      setState((s) => ({ ...s, pendingPrompt: { type: "sudo" } }));
      break;
    case "prompt:gpg":
      setState((s) => ({ ...s, pendingPrompt: { type: "gpg", key: event.key } }));
      break;
    case "prompt:provider":
      setState((s) => ({ ...s, pendingPrompt: { type: "provider", question: event.question, options: event.options } }));
      break;
    case "prompt:generic":
      setState((s) => ({ ...s, pendingPrompt: { type: "generic", question: event.question } }));
      break;
    case "done":
      setState((s) => ({ ...s, result: { code: event.code } }));
      break;
    case "error":
      setState((s) => ({ ...s, error: event.message }));
      break;
  }
}
