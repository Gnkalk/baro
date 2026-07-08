import { theme } from "../../theme";

export function LogScrollbox({ lines }: { lines: string[] }) {
  return (
    <scrollbox viewportCulling={true} flexGrow={1} focused={false} rootOptions={{ backgroundColor: theme.bg.log }} stickyScroll={true} stickyStart="bottom">
      {lines.map((line, i) => (
        <text key={i} fg={theme.text.body}>{line}</text>
      ))}
    </scrollbox>
  );
}
