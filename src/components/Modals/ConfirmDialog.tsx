import { TextAttributes } from "@opentui/core";
import { theme } from "../../theme";

export function ConfirmDialog({
  title,
  message,
  onAnswer,
}: {
  title: string;
  message: string;
  onAnswer: (yes: boolean) => void;
}) {
  const options = [
    { name: "Yes", description: "", value: "y" },
    { name: "No", description: "", value: "n" },
  ];

  return (
    <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={50} alignItems="center" justifyContent="center">
      <box borderStyle="double" borderColor={theme.border.accent} title={title} padding={2} backgroundColor={theme.bg.overlay}>
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>{message}</text>
        <select
          width={20}
          height={options.length}
          options={options}
          focused={true}
          showDescription={false}
          selectedBackgroundColor={theme.bg.selected}
          selectedTextColor={theme.accent.primary}
          onSelect={(_index, option) => onAnswer(option?.value === "y")}
        />
      </box>
    </box>
  );
}
