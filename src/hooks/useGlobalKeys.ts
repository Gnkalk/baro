import { useKeyboard } from "@opentui/react";
import { useNavigation } from "../app/navigationContext";

export function useGlobalKeys(opts: { onHelp: () => void; textInputFocused: boolean }) {
  const { pop, canGoBack, reset } = useNavigation();

  useKeyboard((key) => {
    if (opts.textInputFocused) {
      if (key.name === "escape") pop();
      return;
    }
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      process.exit(0);
    }
    if (key.name === "escape") {
      if (canGoBack) pop();
      return;
    }
    if (key.name === "?") {
      opts.onHelp();
      return;
    }
    if (key.name === "/") {
      reset({ name: "search" });
    }
  });
}
