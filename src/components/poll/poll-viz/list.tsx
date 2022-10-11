import { useTranslation } from "next-i18next";

import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import Plus from "@/components/icons/plus-sm.svg";

import { Button } from "../../button";
import Dropdown, { DropdownItem } from "../../dropdown";
import { usePoll } from "../../poll-provider";
import { usePollStateContext } from "../poll-viz";
import { PollViewOption } from "../types";

const ParticipantSelector = () => {
  const { state, participants, selectParticipant } = usePollStateContext();

  const { t } = useTranslation("app");

  const selectedParticipantId =
    "participantId" in state ? state.participantId : "";

  return (
    <select
      value={selectedParticipantId}
      className="input h-9 w-full pr-8"
      onChange={(e) => {
        selectParticipant(e.target.value ? e.target.value : null);
      }}
    >
      <option value="">
        {t("participantCount", { count: participants.length })}
      </option>
      {participants.map((participant) => {
        return (
          <option key={participant.id} value={participant.id}>
            {participant.name}
          </option>
        );
      })}
    </select>
  );
};

const OptionList = () => {
  const { options } = usePollStateContext();
  return (
    <div className="divide-y">
      {options.map((option) => {
        return (
          <div className="flex p-4" key={option.id}>
            {option.i18nDate}
          </div>
        );
      })}
    </div>
  );
};

export const PollVizList = () => {
  const {
    state,
    setState,
    deleteParticipant,
    editParticipant,
    renameParticipant,
  } = usePollStateContext();
  const { t } = useTranslation("app");
  return (
    <div className="divide-y overflow-hidden rounded-md border bg-white">
      <div className="bg-slate-500/5 p-2">
        <div className="flex gap-2">
          <div className="grow">
            <ParticipantSelector />
          </div>
          {state.type === "read" ? (
            <Button
              icon={<Plus />}
              onClick={() => {
                setState({ type: "create", votes: {} });
              }}
            />
          ) : state.type === "create" || state.type === "edit" ? (
            <Button
              onClick={() => {
                setState({ type: "read" });
              }}
            >
              {t("cancel")}
            </Button>
          ) : state.type === "select" ? (
            <Dropdown
              placement="bottom-end"
              trigger={<Button icon={<DotsHorizontal />} />}
            >
              <DropdownItem
                label={t("editVotes")}
                onClick={() => {
                  editParticipant(state.participantId);
                }}
              />
              <DropdownItem
                label={t("changeName")}
                onClick={() => {
                  renameParticipant(state.participantId);
                }}
              />
              <DropdownItem
                label={t("delete")}
                onClick={() => {
                  deleteParticipant(state.participantId);
                }}
              />
            </Dropdown>
          ) : null}
        </div>
      </div>
      <OptionList />
    </div>
  );
};
