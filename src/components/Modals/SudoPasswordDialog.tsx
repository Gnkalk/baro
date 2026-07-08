import { useRef, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { theme } from "../../theme";

/**
 * Custom masked text entry via raw keypress capture — opentui's <input> has no
 * password-mask mode, so we bypass it entirely to avoid ever rendering the
 * plaintext password on screen.
 */
export function SudoPasswordDialog({ onSubmit }: { onSubmit: (password: string) => void }) {
  const passwordRef = useRef("");
  const [length, setLength] = useState(0);

  useKeyboard((key) => {
    if (key.name === "return") {
      const value = passwordRef.current;
      passwordRef.current = "";
      setLength(0);
      onSubmit(value);
      return;
    }
    if (key.name === "backspace") {
      passwordRef.current = passwordRef.current.slice(0, -1);
      setLength(passwordRef.current.length);
      return;
    }
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
      passwordRef.current += key.sequence;
      setLength(passwordRef.current.length);
    }
  });

  return (
    <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={50} alignItems="center" justifyContent="center">
      <box borderStyle="double" borderColor={theme.border.accent} title="sudo" padding={2} backgroundColor={theme.bg.overlay}>
        <text attributes={TextAttributes.BOLD} fg={theme.text.heading}>[sudo] password required</text>
        <text fg={theme.accent.primary}>{"*".repeat(length)}</text>
        <text attributes={TextAttributes.DIM} fg={theme.text.dim}>Enter to submit · password is not displayed</text>
      </box>
    </box>
  );
}
