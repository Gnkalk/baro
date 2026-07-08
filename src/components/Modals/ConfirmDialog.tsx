import { TextAttributes } from "@opentui/core";

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
      <box borderStyle="double" title={title} padding={2} backgroundColor="#111111">
        <text attributes={TextAttributes.BOLD}>{message}</text>
        <select
          options={options}
          focused={true}
          showDescription={false}
          onSelect={(_index, option) => onAnswer(option?.value === "y")}
        />
      </box>
    </box>
  );
}
