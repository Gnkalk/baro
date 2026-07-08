import { createContext, useCallback, useContext, useReducer, type ReactNode } from "react";

export type Screen =
  | { name: "home" }
  | { name: "search" }
  | { name: "detail"; pkg: { name: string; installed: boolean } }
  | { name: "pkgbuildReview"; pkgNames: string[] }
  | { name: "operationLog"; op: "install" | "remove" | "sysUpgrade" | "cleanCache" | "removeOrphans"; targets: string[] }
  | { name: "update" }
  | { name: "installed" }
  | { name: "status" }
  | { name: "about" };

interface NavState {
  stack: Screen[];
}

type NavAction = { type: "push"; screen: Screen } | { type: "pop" } | { type: "reset"; screen: Screen };

function navigationReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "push":
      return { stack: [...state.stack, action.screen] };
    case "pop":
      return state.stack.length > 1 ? { stack: state.stack.slice(0, -1) } : state;
    case "reset":
      return { stack: [action.screen] };
  }
}

interface NavigationContextValue {
  screen: Screen;
  canGoBack: boolean;
  push: (screen: Screen) => void;
  pop: () => void;
  reset: (screen: Screen) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, { stack: [{ name: "home" }] });

  const push = useCallback((screen: Screen) => dispatch({ type: "push", screen }), []);
  const pop = useCallback(() => dispatch({ type: "pop" }), []);
  const reset = useCallback((screen: Screen) => dispatch({ type: "reset", screen }), []);

  const screen = state.stack[state.stack.length - 1] ?? { name: "home" };

  return (
    <NavigationContext.Provider value={{ screen, canGoBack: state.stack.length > 1, push, pop, reset }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
