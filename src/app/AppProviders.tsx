import type { ReactNode } from "react";
import { NavigationProvider } from "./navigationContext";
import { FocusProvider } from "./focusContext";
import { PackageCacheProvider } from "./packageCacheContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <FocusProvider>
        <PackageCacheProvider>{children}</PackageCacheProvider>
      </FocusProvider>
    </NavigationProvider>
  );
}
