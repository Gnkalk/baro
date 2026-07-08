import { TextAttributes } from "@opentui/core";

export function SelectProviderDialog({
  question,
  options,
  onAnswer,
}: {
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
}) {
  const selectOptions = options.map((opt, i) => ({ name: opt, description: "", value: i }));

  return (
    <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={50} alignItems="center" justifyContent="center">
      <box borderStyle="double" title="Select provider" padding={2} backgroundColor="#111111">
        <text attributes={TextAttributes.BOLD}>{question}</text>
        <select
          options={selectOptions}
          focused={true}
          showDescription={false}
          showScrollIndicator={true}
          onSelect={(index) => onAnswer(index + 1)}
        />
      </box>
    </box>
  );
}
