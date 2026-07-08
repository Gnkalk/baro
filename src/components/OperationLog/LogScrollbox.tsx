export function LogScrollbox({ lines }: { lines: string[] }) {
  return (
    <scrollbox flexGrow={1} focused={false} rootOptions={{ backgroundColor: "#0a0a0a" }} stickyScroll={true} stickyStart="bottom">
      {lines.map((line, i) => (
        <text key={i}>{line}</text>
      ))}
    </scrollbox>
  );
}
