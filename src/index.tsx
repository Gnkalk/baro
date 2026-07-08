import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { AppProviders } from "./app/AppProviders";
import { AppShell } from "./app/AppShell";

function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
