const PARU_ENV = {
  ...process.env,
  LANG: "C",
  LC_ALL: "C",
};

export interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
}

/** Runs paru to completion and collects all output. For read-only query commands. */
export async function runParu(args: string[]): Promise<RunResult> {
  const proc = Bun.spawn(["paru", "--color=never", ...args], {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    env: PARU_ENV,
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, code };
}

export interface ParuProcessHandle {
  proc: Bun.Subprocess<"pipe", "pipe", "pipe">;
  writeStdin(data: string): void;
  closeStdin(): void;
  exited: Promise<number>;
}

/** Splits a stream of chunks into lines, treating both \n and \r as terminators (for progress bars). */
export class LineSplitter {
  private buffer = "";

  push(chunk: string): string[] {
    this.buffer += chunk;
    const lines: string[] = [];
    let idx: number;
    while ((idx = this.buffer.search(/[\r\n]/)) !== -1) {
      lines.push(this.buffer.slice(0, idx));
      this.buffer = this.buffer.slice(idx + 1);
    }
    return lines;
  }

  flush(): string[] {
    if (this.buffer.length === 0) return [];
    const rest = this.buffer;
    this.buffer = "";
    return [rest];
  }
}

/** Spawns paru with piped stdio for long-running interactive operations. Never uses "inherit". */
export function spawnParu(
  args: string[],
  handlers: { onStdout: (line: string) => void; onStderr: (line: string) => void },
): ParuProcessHandle {
  const proc = Bun.spawn(["paru", "--color=never", ...args], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: PARU_ENV,
  });

  const pump = async (stream: ReadableStream<Uint8Array>, onLine: (line: string) => void) => {
    const splitter = new LineSplitter();
    const decoder = new TextDecoder();
    for await (const chunk of stream) {
      for (const line of splitter.push(decoder.decode(chunk, { stream: true }))) {
        onLine(line);
      }
    }
    for (const line of splitter.flush()) onLine(line);
  };

  void pump(proc.stdout, handlers.onStdout);
  void pump(proc.stderr, handlers.onStderr);

  return {
    proc,
    writeStdin(data: string) {
      proc.stdin.write(data);
      proc.stdin.flush();
    },
    closeStdin() {
      proc.stdin.end();
    },
    exited: proc.exited,
  };
}
