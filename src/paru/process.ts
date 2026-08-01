const PARU_ENV = {
  ...process.env,
  LANG: "C",
  LC_ALL: "C",
  TERM: "dumb",
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

export class LineSplitter {
  private buffer = "";
  private replaceNext = false;
  private cursorOffset = 0;

  push(chunk: string): Array<{ text: string; offset: number }> {
    this.buffer += chunk;
    
    // Strip completed ANSI escape sequences EXCEPT cursor up (A)
    this.buffer = this.buffer.replace(/\x1b\[[0-9;]*[B-Z]/gi, '');
    
    // If the buffer ends with an incomplete ANSI sequence, wait for more chunks
    if (this.buffer.match(/\x1b\[?[0-9;]*$/)) {
      return [];
    }

    const lines: Array<{ text: string; offset: number }> = [];
    
    // Normalize CRLF to LF to avoid empty replace lines
    this.buffer = this.buffer.replace(/\r\n/g, '\n');

    let match: RegExpMatchArray | null;
    while ((match = this.buffer.match(/(\r|\n|\x1b\[[0-9]+A)/))) {
      const idx = match.index!;
      const token = match[0];
      
      const text = this.buffer.slice(0, idx);
      
      let offset = 0;
      if (this.cursorOffset > 0) {
        offset = this.cursorOffset;
      } else if (this.replaceNext) {
        offset = 1;
      }

      if (text.length > 0 || this.replaceNext) {
        lines.push({ text, offset });
      }

      if (token === '\n') {
        if (this.cursorOffset > 0) this.cursorOffset--;
        this.replaceNext = false;
      } else if (token === '\r') {
        this.replaceNext = true;
      } else if (token.endsWith('A')) {
        const count = parseInt(token.replace(/\D/g, ''), 10) || 1;
        this.cursorOffset += count;
      }

      this.buffer = this.buffer.slice(idx + token.length);
    }
    return lines;
  }

  getBuffer(): string {
    return this.buffer;
  }

  flush(): Array<{ text: string; offset: number }> {
    if (this.buffer.length === 0) return [];
    const rest = this.buffer;
    this.buffer = "";
    const offset = this.cursorOffset > 0 ? this.cursorOffset : (this.replaceNext ? 1 : 0);
    return [{ text: rest, offset }];
  }
}

/** Spawns paru with piped stdio for long-running interactive operations. Never uses "inherit". */
export function spawnParu(
  args: string[],
  handlers: { onStdout: (line: string, replace?: boolean) => void; onStderr: (line: string, replace?: boolean) => void; onBuffer?: (buf: string) => void },
): ParuProcessHandle {
  const paruArgs = ["paru", "--color=never", ...args];
  const escapedCmd = paruArgs.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ");
  
  const proc = Bun.spawn(["script", "-q", "-e", "-c", `stty -opost; ${escapedCmd}`, "/dev/null"], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: PARU_ENV,
  });

  const pump = async (stream: ReadableStream<Uint8Array>, onLine: (line: string, offset?: number) => void, onBuffer?: (buf: string) => void) => {
    const splitter = new LineSplitter();
    const decoder = new TextDecoder();
    for await (const chunk of stream) {
      for (const lineObj of splitter.push(decoder.decode(chunk, { stream: true }))) {
        onLine(lineObj.text, lineObj.offset);
      }
      if (onBuffer && splitter.getBuffer().length > 0) {
        onBuffer(splitter.getBuffer());
      }
    }
    for (const lineObj of splitter.flush()) onLine(lineObj.text, lineObj.offset);
  };

  void pump(proc.stdout, handlers.onStdout, handlers.onBuffer);
  void pump(proc.stderr, handlers.onStderr, handlers.onBuffer);

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
