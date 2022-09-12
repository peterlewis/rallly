import React from "react";

import { useRequiredContext } from "./use-required-context";

const ScrollSyncContext =
  React.createContext<{
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    setScroll: (left: number) => void;
    registerPane: (ref: React.RefObject<HTMLDivElement>) => void;
    unregisterPane: (ref: React.RefObject<HTMLDivElement>) => void;
  } | null>(null);

export const ScrollSync: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const refs = React.useRef<Set<React.RefObject<HTMLDivElement>>>(new Set());

  return (
    <ScrollSyncContext.Provider
      value={{
        registerPane: (ref) => {
          refs.current.add(ref);
        },
        unregisterPane: (ref) => {
          refs.current.delete(ref);
        },
        setScroll: (left) => {
          refs.current.forEach((ref) => {
            if (ref.current) {
              ref.current.scrollLeft = left;
            }
          });
        },
        onScroll: (e) => {
          refs.current.forEach((ref) => {
            if (ref.current && e.target !== ref.current) {
              ref.current.scrollLeft = e.currentTarget.scrollLeft;
            }
          });
        },
      }}
    >
      {children}
    </ScrollSyncContext.Provider>
  );
};

export const useScrollSync = () => {
  const { onScroll, registerPane, unregisterPane, setScroll } =
    useRequiredContext(ScrollSyncContext, "ScrollSync");

  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    registerPane(ref);
    return () => {
      unregisterPane(ref);
    };
  }, [registerPane, unregisterPane]);

  return { ref, onScroll, unregisterPane, setScroll };
};

export const ScrollSyncPane = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function ScrollSyncPane({ children, ...forwardedProps }, ref) {
  const props = useScrollSync();

  return (
    <div
      ref={(el) => {
        props.ref.current = el;
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      {...forwardedProps}
      onScroll={(e) => {
        props.onScroll(e);
      }}
    >
      {children}
    </div>
  );
});
