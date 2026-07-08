import { useMemo } from "react";
import { SyntaxStyle, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { getPkgbuild } from "../paru/queries";
import { useAsyncQuery } from "../hooks/useAsyncQuery";

export function PkgbuildReviewScreen({ pkgNames }: { pkgNames: string[] }) {
  const { push, pop } = useNavigation();
  const firstPkg = pkgNames[0] ?? "";
  const syntaxStyle = useMemo(() => SyntaxStyle.create(), []);

  const { data: content, loading, error } = useAsyncQuery<string>(() => getPkgbuild(firstPkg), [firstPkg]);

  useKeyboard((key) => {
    if (loading) return;
    if (key.name === "y" || key.name === "return") {
      push({ name: "operationLog", op: "install", targets: pkgNames });
    }
    if (key.name === "n") {
      pop();
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box borderStyle="single" title={`PKGBUILD: ${firstPkg}`} flexGrow={1} flexDirection="column" padding={1}>
        {loading && <text attributes={TextAttributes.DIM}>Fetching PKGBUILD...</text>}
        {error && <text fg="red">Error: {error}</text>}
        {content && <code content={content} filetype="bash" syntaxStyle={syntaxStyle} />}
      </box>
      <text attributes={TextAttributes.DIM}>y / Enter: confirm and install · n / Esc: cancel</text>
    </box>
  );
}
