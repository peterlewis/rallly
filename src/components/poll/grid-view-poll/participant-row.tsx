import { VoteType } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";

import CompactButton from "@/components/compact-button";
import Pencil from "@/components/icons/pencil-alt.svg";
import Trash from "@/components/icons/trash.svg";

import { ParticipantForm, PollViewOption } from "../types";
import UserAvatar from "../user-avatar";
import VoteIcon from "../vote-icon";
import ControlledScrollArea from "./controlled-scroll-area";
import { usePollContext } from "./poll-context";

export interface ParticipantRowProps {
  name: string;
  options: PollViewOption[];
  votes: Array<VoteType | undefined>;
  editMode: boolean;
  onChangeEditMode: (value: boolean) => void;
  onChange: (participant: ParticipantForm) => Promise<void>;
  onDelete: () => Promise<void>;
  isYou?: boolean;
  isEditable?: boolean;
  className?: string;
  active?: boolean;
}

export const ParticipantRowView: React.VoidFunctionComponent<{
  name: string;
  color?: string;
  votes: Array<VoteType | undefined>;
  onEdit?: () => void;
  onDelete?: () => void;
  columnWidth: number;
  sidebarWidth: number;
  isYou?: boolean;
  className?: string;
  active?: boolean;
}> = ({
  name,
  votes,
  onEdit,
  onDelete,
  sidebarWidth,
  columnWidth,
  active,
  isYou,
  color,
  className,
}) => {
  return (
    <div
      data-testid="participant-row"
      className={clsx("group flex h-14 py-1", className)}
    >
      <div
        className="absolute flex h-14 shrink-0 items-center pr-1 pl-4"
        style={{ width: sidebarWidth, marginLeft: sidebarWidth * -1 }}
        onClick={onEdit}
      >
        <UserAvatar
          className="mr-2"
          name={name}
          showName={true}
          isYou={isYou}
          color={color}
        />
      </div>
      <div className="flex">
        {votes.map((vote, i) => {
          return (
            <div
              key={i}
              className="relative flex shrink-0 items-center justify-center pr-2 transition-colors"
              style={{ width: columnWidth }}
            >
              <div
                className={clsx(
                  "flex h-12 w-full items-center justify-center rounded-md border",
                  {
                    "border-green-600/10 bg-green-100/75": vote === "yes",
                    "border-amber-600/10 bg-amber-100/75": vote === "ifNeedBe",
                    "border-slate-300/40 bg-slate-300/5": vote === "no",
                  },
                )}
              >
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ParticipantRow: React.VoidFunctionComponent<ParticipantRowProps> = ({
  name,
  votes,
  editMode,
  options,
  onChangeEditMode,
  onChange,
  onDelete,
  isYou,
  active,
  isEditable,
  className,
}) => {
  const { columnWidth, sidebarWidth } = usePollContext();

  return (
    <ParticipantRowView
      sidebarWidth={sidebarWidth}
      columnWidth={columnWidth}
      name={name}
      votes={votes}
      isYou={isYou}
      className={className}
      active={active}
      onEdit={() => {
        onChangeEditMode?.(true);
      }}
      onDelete={onDelete}
    />
  );
};

export default ParticipantRow;
