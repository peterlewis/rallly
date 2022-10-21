import clsx from "clsx";
import { useTranslation } from "next-i18next";

import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import Pencil from "@/components/icons/pencil.svg";
import Tag from "@/components/icons/tag.svg";
import Trash from "@/components/icons/trash.svg";
import User from "@/components/icons/user.svg";

import CompactButton from "../../../compact-button";
import Dropdown, { DropdownItem } from "../../../dropdown";
import { ScrollSyncPane } from "../../../scroll-sync";
import { useGridContext } from "../../grid-view-poll";
import { usePollStateContext } from "../../poll-viz";
import { PollViewParticipant } from "../../types";
import UserAvatar from "../../user-avatar";
import VoteIcon from "../../vote-icon";

export const GridBodyRow: React.VoidFunctionComponent<{
  participant: PollViewParticipant;
  color?: string;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
}> = ({ participant, color, disabled, selected, className }) => {
  const { name, votes, you } = participant;
  const {
    setState,
    renameParticipant,
    selectParticipant,
    editParticipant,
    deleteParticipant,
  } = usePollStateContext();
  const { sidebarWidth, columnWidth, numberOfVisibleColumns } =
    useGridContext();
  const { t } = useTranslation("app");
  return (
    <div
      data-testid="participant-row"
      className={clsx(
        "flex h-14 select-none",
        {
          "bg-white/50": selected,
        },
        className,
      )}
    >
      <div
        className={clsx(
          "flex h-full shrink-0 items-center justify-between  space-x-2 border-l-4 border-r pr-4 pl-4",
          {
            "border-l-primary-500": selected,
            "border-l-transparent": !selected,
          },
        )}
        style={{ width: sidebarWidth }}
      >
        <UserAvatar name={name} showName={true} color={color} isYou={you} />
        <Dropdown
          placement="bottom-start"
          trigger={<CompactButton icon={DotsHorizontal} />}
        >
          <DropdownItem
            disabled={!participant.editable}
            label={t("editVotes")}
            icon={Pencil}
            onClick={() => {
              editParticipant(participant.id);
            }}
          />
          <DropdownItem
            disabled={!participant.editable}
            icon={Tag}
            label={t("changeName")}
            onClick={() => {
              renameParticipant(participant.id);
            }}
          />
          <DropdownItem
            disabled={!participant.editable}
            label={t("delete")}
            icon={Trash}
            onClick={() => {
              deleteParticipant(participant.id);
            }}
          />
        </Dropdown>
      </div>
      <ScrollSyncPane
        className="no-scrollbar flex overflow-x-auto overflow-y-hidden"
        style={{ width: numberOfVisibleColumns * columnWidth }}
      >
        {votes.map((vote, i) => {
          return (
            <div
              key={i}
              className={clsx(
                "relative flex h-14 shrink-0 items-center justify-center border-r bg-white",
              )}
              style={{ width: columnWidth }}
            >
              <VoteIcon className={clsx("rounded-full", {})} type={vote} />
            </div>
          );
        })}
      </ScrollSyncPane>
    </div>
  );
};

export const GridBody: React.VoidFunctionComponent<{
  participants: PollViewParticipant[];
  selectedParticipantId: string | null;
  className?: string;
}> = ({ participants, selectedParticipantId }) => {
  return (
    <div className="overflow-hidden bg-gray-100">
      <div className="divide-y">
        {participants.map((participant) => {
          return (
            <GridBodyRow
              key={participant.id}
              participant={participant}
              selected={selectedParticipantId === participant.id}
            />
          );
        })}
      </div>
    </div>
  );
};
