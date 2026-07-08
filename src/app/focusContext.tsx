import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface FocusContextValue {
  activeId: string | null;
  register: (id: string) => void;
  unregister: (id: string) => void;
  focusNext: () => void;
  focusPrev: () => void;
  focus: (id: string) => void;
}

const FocusContext = createContext<FocusContextValue | null>(null);

export function FocusProvider({ children }: { children: ReactNode }) {
  const order = useRef<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const register = useCallback((id: string) => {
    if (!order.current.includes(id)) order.current.push(id);
    setActiveId((current) => current ?? id);
  }, []);

  const unregister = useCallback((id: string) => {
    order.current = order.current.filter((x) => x !== id);
    setActiveId((current) => (current === id ? (order.current[0] ?? null) : current));
  }, []);

  const shift = useCallback((delta: number) => {
    setActiveId((current) => {
      const ids = order.current;
      if (ids.length === 0) return current;
      const idx = current ? ids.indexOf(current) : -1;
      const next = ((idx === -1 ? 0 : idx + delta) + ids.length) % ids.length;
      return ids[next] ?? current;
    });
  }, []);

  const focusNext = useCallback(() => shift(1), [shift]);
  const focusPrev = useCallback(() => shift(-1), [shift]);
  const focus = useCallback((id: string) => setActiveId(id), []);

  return (
    <FocusContext.Provider value={{ activeId, register, unregister, focusNext, focusPrev, focus }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocusManager(): FocusContextValue {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocusManager must be used within FocusProvider");
  return ctx;
}
