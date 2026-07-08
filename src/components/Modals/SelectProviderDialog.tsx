import { TextAttributes } from "@opentui/core";
import { theme } from "../../theme";

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
      <box borderStyle="double" borderColor={theme.border.accent} title="Select provider" padding={2} backgroundColor={theme.bg.overlay}>
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>{question}</text>
        <select
          width={40}
          height={Math.min(selectOptions.length, 8)}
          options={selectOptions}
          focused={true}
          showDescription={false}
          showScrollIndicator={true}
          selectedBackgroundColor={theme.bg.selected}
          selectedTextColor={theme.accent.primary}
          onSelect={(index) => onAnswer(index + 1)}
        />
      </box>
    </box>
  );
}
