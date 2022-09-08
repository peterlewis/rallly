import clsx from "clsx";
import React from "react";

import { usePollContext } from "./poll-context";

const ControlledScrollArea: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  className?: string;
}> = ({ className, children }) => {
  const { scrollPosition, sidebarWidth, setScrollPosition } = usePollContext();

  const ref = React.useRef<HTMLDivElement>(null);

  if (ref.current) {
    ref.current.scrollLeft = scrollPosition;
  }

  return (
    <div
      ref={ref}
      className={clsx(
        "no-scrollbar box-border min-w-0 select-none overflow-y-auto",
        className,
      )}
      style={{ marginLeft: sidebarWidth }}
      onScroll={(e) => {
        setScrollPosition(e.currentTarget.scrollLeft);
      }}
    >
      <div className="h-full">{children}</div>
    </div>
  );
};

export default ControlledScrollArea;
