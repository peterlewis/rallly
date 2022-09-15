import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";

import Calendar from "@/components/icons/calendar.svg";
import DotsVertical from "@/components/icons/dots-horizontal.svg";
import Pencil from "@/components/icons/pencil.svg";
import Trash from "@/components/icons/trash.svg";

import CompactButton from "../../compact-button";
import Dropdown, { DropdownItem } from "../../dropdown";
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
  columnWidth: number;
  sidebarWidth: number;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeName?: () => void;
}> = ({
  name,
  votes,
  sidebarWidth,
  columnWidth,
  color,
  className,
  onEdit,
  onDelete,
  onChangeName,
}) => {
  const { t } = useTranslation("app");
  return (
    <div
      data-testid="participant-row"
      className={clsx("group flex h-14 py-1", className)}
    >
      <div
        className="absolute flex h-14 shrink-0 items-center justify-between pr-4 pl-4"
        style={{ width: sidebarWidth, marginLeft: sidebarWidth * -1 }}
      >
        <UserAvatar
          className="mr-2"
          name={name}
          showName={true}
          color={color}
        />
        <Dropdown
          placement="bottom-start"
          trigger={
            <button className="inline-flex h-5 w-5 items-center justify-center text-slate-400/50 hover:text-slate-400">
              <DotsVertical className="h-4" />
            </button>
          }
        >
          <DropdownItem
            icon={Calendar}
            label={t("editVotes")}
            onClick={onEdit}
            disabled={!onEdit}
          />
          <DropdownItem
            icon={Pencil}
            label={t("changeName")}
            onClick={onChangeName}
            disabled={!onChangeName}
          />
          <DropdownItem
            icon={Trash}
            label={t("delete")}
            onClick={onDelete}
            disabled={!onDelete}
          />
        </Dropdown>
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
  options,
  className,
}) => {
  const { columnWidth, sidebarWidth } = usePollContext();

  return (
    <ParticipantRowView
      sidebarWidth={sidebarWidth}
      columnWidth={columnWidth}
      name={name}
      votes={votes}
      className={className}
    />
  );
};

export default ParticipantRow;
