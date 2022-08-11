import { VoteType } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";

import CompactButton from "@/components/compact-button";
import Pencil from "@/components/icons/pencil-alt.svg";
import Trash from "@/components/icons/trash.svg";

import { ParticipantForm, PollOption } from "../types";
import UserAvatar from "../user-avatar";
import VoteIcon from "../vote-icon";
import ControlledScrollArea from "./controlled-scroll-area";
import ParticipantRowForm from "./participant-row-form";
import { usePollContext } from "./poll-context";

export interface ParticipantRowProps {
  name: string;
  options: PollOption[];
  votes: Array<VoteType | undefined>;
  editMode: boolean;
  onChangeEditMode: (value: boolean) => void;
  onChange: (participant: ParticipantForm) => Promise<void>;
  onDelete: () => Promise<void>;
  isYou?: boolean;
  isEditable?: boolean;
}

export const ParticipantRowView: React.VoidFunctionComponent<{
  name: string;
  isEditable?: boolean;
  color?: string;
  votes: Array<VoteType | undefined>;
  onEdit?: () => void;
  onDelete?: () => void;
  columnWidth: number;
  sidebarWidth: number;
  isYou?: boolean;
}> = ({
  name,
  isEditable,
  votes,
  onEdit,
  onDelete,
  sidebarWidth,
  columnWidth,
  isYou,
  color,
}) => {
  return (
    <div data-testid="participant-row" className="group flex h-14">
      <div
        className="flex shrink-0 items-center px-4"
        style={{ width: sidebarWidth }}
      >
        <UserAvatar
          className="mr-2"
          name={name}
          showName={true}
          isYou={isYou}
          color={color}
        />
        {isEditable ? (
          <div className="hidden shrink-0 items-center space-x-2 overflow-hidden group-hover:flex">
            <CompactButton icon={Pencil} onClick={onEdit} />
            <CompactButton icon={Trash} onClick={onDelete} />
          </div>
        ) : null}
      </div>
      <ControlledScrollArea>
        {votes.map((vote, i) => {
          return (
            <div
              key={i}
              className="relative flex shrink-0 items-center justify-center px-2 transition-colors"
              style={{ width: columnWidth }}
            >
              <div
                className={clsx(
                  "flex h-10 w-full items-center justify-center rounded-md",
                  {
                    "bg-green-50": vote === "yes",
                    "bg-amber-50": vote === "ifNeedBe",
                    "bg-slate-50": vote === "no",
                  },
                )}
              >
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </ControlledScrollArea>
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
  isEditable,
}) => {
  const { columnWidth, sidebarWidth } = usePollContext();

  if (editMode) {
    return (
      <ParticipantRowForm
        options={options}
        defaultValues={{
          name: name,
          votes,
        }}
        onSubmit={async (participant) => {
          await onChange(participant);
          onChangeEditMode?.(false);
        }}
        onCancel={() => onChangeEditMode?.(false)}
      />
    );
  }

  return (
    <ParticipantRowView
      sidebarWidth={sidebarWidth}
      columnWidth={columnWidth}
      name={name}
      votes={votes}
      isEditable={isEditable}
      isYou={isYou}
      onEdit={() => {
        onChangeEditMode?.(true);
      }}
      onDelete={onDelete}
    />
  );
};

export default ParticipantRow;
