import clsx from "clsx";
import React from "react";

import { useRequiredContext } from "./use-required-context";

const ScrollSyncContext =
  React.createContext<{
    left: number;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    setScroll: (left: number) => void;
    registerPane: (ref: React.RefObject<HTMLDivElement>) => void;
    unregisterPane: (ref: React.RefObject<HTMLDivElement>) => void;
  } | null>(null);

export const ScrollSync: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const refs = React.useRef<Set<React.RefObject<HTMLDivElement>>>(new Set());
  const [left, setLeft] = React.useState(0);

  return (
    <ScrollSyncContext.Provider
      value={{
        left,
        registerPane: (ref) => {
          refs.current.add(ref);
        },
        unregisterPane: (ref) => {
          refs.current.delete(ref);
        },
        setScroll: (left) => {
          setLeft(left);
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
  const { left, onScroll, registerPane, unregisterPane, setScroll } =
    useRequiredContext(ScrollSyncContext, "ScrollSync");

  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    registerPane(ref);
    return () => {
      unregisterPane(ref);
    };
  }, [registerPane, unregisterPane]);

  return { ref, left, onScroll, unregisterPane, setScroll };
};

export const ScrollSyncPane = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function ScrollSyncPane({ children, className, ...forwardedProps }, ref) {
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
      className={clsx("select-none", className)}
    >
      {children}
    </div>
  );
});
