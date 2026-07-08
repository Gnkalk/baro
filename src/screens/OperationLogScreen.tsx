import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";
import { useParuOperation } from "../hooks/useParuOperation";
import { LogScrollbox } from "../components/OperationLog/LogScrollbox";
import { SudoPasswordDialog } from "../components/Modals/SudoPasswordDialog";
import { GpgConfirmDialog } from "../components/Modals/GpgConfirmDialog";
import { SelectProviderDialog } from "../components/Modals/SelectProviderDialog";
import { GenericPromptDialog } from "../components/Modals/GenericPromptDialog";
import type { OperationKind } from "../paru/types";
import { theme, screenAccent } from "../theme";

const TITLES: Record<OperationKind, string> = {
  install: "Installing",
  remove: "Removing",
  sysUpgrade: "System upgrade",
  cleanCache: "Cleaning cache",
  removeOrphans: "Removing orphans",
};

export function OperationLogScreen({ op, targets }: { op: OperationKind; targets: string[] }) {
  const { reset } = useNavigation();
  const { logs, pendingPrompt, result, error, resolvePrompt } = useParuOperation(op, targets);

  useKeyboard((key) => {
    if (result && key.name === "return") reset({ name: "home" });
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={theme.bg.base}>
      <box
        borderStyle="single"
        borderColor={screenAccent.operationLog}
        title={`${TITLES[op]}${targets.length > 0 ? ": " + targets.join(", ") : ""}`}
        flexGrow={1}
        flexDirection="column"
      >
        <LogScrollbox lines={logs} />
      </box>
      {error && <text fg={theme.semantic.error}>{`Error: ${error}`}</text>}
      {result && (
        <text attributes={TextAttributes.BOLD} fg={result.code === 0 ? theme.semantic.success : theme.semantic.error}>
          {`${result.code === 0 ? "Done." : `Exited with code ${result.code}.`} Press Enter to return home.`}
        </text>
      )}
      {!result && <text attributes={TextAttributes.DIM} fg={theme.accent.primary}>Running...</text>}

      {pendingPrompt?.type === "sudo" && <SudoPasswordDialog onSubmit={resolvePrompt} />}
      {pendingPrompt?.type === "gpg" && <GpgConfirmDialog pgpKey={pendingPrompt.key} onAnswer={(yes) => resolvePrompt(yes ? "y" : "n")} />}
      {pendingPrompt?.type === "provider" && (
        <SelectProviderDialog question={pendingPrompt.question} options={pendingPrompt.options} onAnswer={(index) => resolvePrompt(String(index))} />
      )}
      {pendingPrompt?.type === "generic" && <GenericPromptDialog question={pendingPrompt.question} onAnswer={resolvePrompt} />}
    </box>
  );
}
