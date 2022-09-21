import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { ScrollSyncPane } from "../../scroll-sync";
import { useGridContext } from "../grid-view-poll";
import { PollViewOption } from "../types";
import UserAvatar from "../user-avatar";
import VoteIcon from "../vote-icon";
import { usePollContext } from "./poll-context";

export interface ParticipantRowProps {
  name: string;
  options: PollViewOption[];
  votes: Array<VoteType | undefined>;
  className?: string;
}

export const ParticipantRowView: React.VoidFunctionComponent<{
  name: string;
  color?: string;
  votes: Array<VoteType | undefined>;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}> = ({ name, votes, color, disabled, selected, className, onSelect }) => {
  const { sidebarWidth, columnWidth } = useGridContext();
  return (
    <div
      role={!disabled ? "button" : "container"}
      data-testid="participant-row"
      onClick={!disabled ? onSelect : undefined}
      className={clsx(
        "flex h-14 select-none",
        {
          "bg-white/30": selected,
          "hover:bg-white/50 active:bg-slate-500/5": !disabled,
        },
        className,
      )}
    >
      <div
        className={clsx("flex h-full shrink-0 items-center border-r pl-4")}
        style={{ width: sidebarWidth }}
      >
        <UserAvatar name={name} showName={true} color={color} />
      </div>
      <ScrollSyncPane className="no-scrollbar flex overflow-x-auto overflow-y-hidden">
        {votes.map((vote, i) => {
          return (
            <div
              key={i}
              className={clsx(
                "relative flex h-14 shrink-0 items-center justify-center border-r bg-white/30",
              )}
              style={{ width: columnWidth }}
            >
              <VoteIcon
                className="rounded-full shadow-slate-500/30"
                type={vote}
              />
            </div>
          );
        })}
      </ScrollSyncPane>
    </div>
  );
};

const ParticipantRow: React.VoidFunctionComponent<ParticipantRowProps> = ({
  name,
  votes,
  options,
  className,
}) => {
  return <ParticipantRowView name={name} votes={votes} className={className} />;
};

export default ParticipantRow;
