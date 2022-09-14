import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, FormProvider } from "react-hook-form";

import Check from "@/components/icons/check.svg";
import ChevronDown from "@/components/icons/chevron-down.svg";
import Pencil from "@/components/icons/pencil-alt.svg";
import PlusSm from "@/components/icons/plus-sm.svg";
import Trash from "@/components/icons/trash.svg";
import { usePoll } from "@/components/poll-provider";

import { useDayjs } from "../../utils/dayjs";
import { requiredString } from "../../utils/form-validation";
import { Button } from "../button";
import { styleMenuItem } from "../menu-styles";
import NameInput from "../name-input";
import GroupedOptions from "./list-view-poll/grouped-options";
import { ParticipantForm, PollProps } from "./types";
import UserAvatar from "./user-avatar";

const ListViewPoll: React.VoidFunctionComponent<PollProps> = ({
  options,
  participants,
  value,
  onChange,
  onEntry,
  onUpdateEntry,
  onDeleteEntry,
  userAlreadyVoted,
  onChangeActiveParticipant,
  activeParticipant,
}) => {
  const pollContext = usePoll();

  const { poll } = pollContext;

  const [isEditing, setIsEditing] = React.useState(
    !userAlreadyVoted && !poll.closed,
  );

  const formRef = React.useRef<HTMLFormElement>(null);

  const { t } = useTranslation("app");
  const { dayjs } = useDayjs();
  return (
    <form className="mobile:zero-padding border-y bg-white" ref={formRef}>
      <div className="sticky top-12 z-30 flex flex-col space-y-2 border-b bg-gray-50 px-4 py-3 sm:px-6">
        <div className="flex space-x-3">
          {!isEditing ? (
            <Listbox
              value={activeParticipant?.id}
              onChange={(participantId) => {
                // onChangeActiveParticipant(participantId ?? null);
              }}
              disabled={isEditing}
            >
              <div className="menu min-w-0 grow">
                <Listbox.Button
                  as={Button}
                  className="w-full"
                  disabled={!isEditing}
                  data-testid="participant-selector"
                >
                  <div className="min-w-0 grow text-left">
                    {activeParticipant ? (
                      <div className="flex items-center space-x-2">
                        <UserAvatar
                          name={activeParticipant.name}
                          showName={true}
                        />
                      </div>
                    ) : (
                      t("participantCount", { count: participants.length })
                    )}
                  </div>
                  <ChevronDown className="h-5 shrink-0" />
                </Listbox.Button>
                <Listbox.Options
                  as={motion.div}
                  transition={{
                    duration: 0.1,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="menu-items max-h-72 w-full overflow-auto"
                >
                  <Listbox.Option value={undefined} className={styleMenuItem}>
                    {t("participantCount", { count: participants.length })}
                  </Listbox.Option>
                  {participants.map((participant) => (
                    <Listbox.Option
                      key={participant.id}
                      value={participant.id}
                      className={styleMenuItem}
                    >
                      <div className="flex items-center space-x-2">
                        <UserAvatar name={participant.name} showName={true} />
                      </div>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          ) : null}
          {isEditing ? (
            <Button
              onClick={() => {
                setIsEditing(false);
              }}
            >
              {t("cancel")}
            </Button>
          ) : activeParticipant ? (
            <div className="flex space-x-3">
              <Button
                icon={<Pencil />}
                disabled={poll.closed}
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                {t("edit")}
              </Button>
              <Button
                icon={<Trash />}
                disabled={poll.closed}
                data-testid="delete-participant-button"
                type="danger"
                onClick={() => {
                  if (activeParticipant) {
                    onDeleteEntry?.(activeParticipant.id);
                  }
                }}
              />
            </div>
          ) : (
            <Button
              icon={<PlusSm />}
              disabled={poll.closed}
              onClick={() => {
                setIsEditing(true);
              }}
            >
              {t("new")}
            </Button>
          )}
        </div>
      </div>
      <GroupedOptions
        selectedParticipantId={activeParticipant?.id}
        options={options}
        editable={isEditing}
        groupClassName="top-[61px]"
        group={(option) => {
          if (option.type === "time") {
            return dayjs(option.start).format("LL");
          } else {
            return dayjs(option.date).format("MMMM YYYY");
          }
        }}
      />
    </form>
  );
};

export default ListViewPoll;
