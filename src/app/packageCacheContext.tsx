import { createContext, useContext, useRef, type ReactNode } from "react";
import type { Package, PackageInfo } from "../paru/types";

interface PackageCacheValue {
  searchResults: Map<string, Package[]>;
  packageInfo: Map<string, PackageInfo | null>;
}

const PackageCacheContext = createContext<PackageCacheValue | null>(null);

export function PackageCacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<PackageCacheValue>({ searchResults: new Map(), packageInfo: new Map() });
  return <PackageCacheContext.Provider value={cache.current}>{children}</PackageCacheContext.Provider>;
}

export function usePackageCache(): PackageCacheValue {
  const ctx = useContext(PackageCacheContext);
  if (!ctx) throw new Error("usePackageCache must be used within PackageCacheProvider");
  return ctx;
}
