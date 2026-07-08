import { useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { theme } from "../../theme";

/** Safety-net dialog for prompt text we haven't specifically pattern-matched. */
export function GenericPromptDialog({ question, onAnswer }: { question: string; onAnswer: (answer: string) => void }) {
  const [value, setValue] = useState("");

  useKeyboard((key) => {
    if (key.name === "return") {
      const v = value;
      setValue("");
      onAnswer(v);
    }
  });

  return (
    <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={50} alignItems="center" justifyContent="center">
      <box borderStyle="double" borderColor={theme.border.accent} title="paru is waiting for input" padding={2} backgroundColor={theme.bg.overlay}>
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>{question}</text>
        <input placeholder="type answer, Enter to submit" focused={true} value={value} onInput={setValue} />
      </box>
    </box>
  );
}
