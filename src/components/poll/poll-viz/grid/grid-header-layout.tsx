import clsx from "clsx";
import React from "react";

import { Sticky } from "../../../sticky";
import { useGridContext } from "../../grid-view-poll";
import { usePollStateContext } from "../../poll-viz";

export const GridHeaderLayout: React.VoidFunctionComponent<{
  topbar?: React.ReactNode;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ topbar, sidebar, children }) => {
  const { sidebarWidth } = useGridContext();
  const { participants } = usePollStateContext();
  return (
    <Sticky
      top={120}
      className={(isPinned) =>
        clsx("group z-20 border-y bg-gray-100/90 backdrop-blur-md", {
          "rounded-t-md border-t-transparent": !isPinned,
          "rounded-b-md": participants.length === 0,
          "shadow-[0_3px_3px_0px_rgba(0,0,0,0.02)]": isPinned,
        })
      }
    >
      {topbar ? <div className="border-b">{topbar}</div> : null}
      <div className="flex w-fit max-w-full">
        <div className="shrink-0 border-r p-4" style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
        <div className="min-w-0 grow">{children}</div>
      </div>
    </Sticky>
  );
};
