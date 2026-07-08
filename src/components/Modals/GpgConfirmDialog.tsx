import { ConfirmDialog } from "./ConfirmDialog";

export function GpgConfirmDialog({ pgpKey, onAnswer }: { pgpKey: string; onAnswer: (yes: boolean) => void }) {
  return <ConfirmDialog title="GPG key import" message={`Import PGP key ${pgpKey}?`} onAnswer={onAnswer} />;
}
