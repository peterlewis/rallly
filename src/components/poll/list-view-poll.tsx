import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

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
import { usePollData } from "./poll-data-provider";
import { ParticipantForm, PollProps } from "./types";
import UserAvatar from "./user-avatar";

const ListViewPoll: React.VoidFunctionComponent<PollProps> = ({
  options,
  participants,
  onEntry,
  onUpdateEntry,
  onDeleteEntry,
  userAlreadyVoted,
}) => {
  const pollContext = usePoll();

  const { getParticipantInfoById } = usePollData();
  const { poll } = pollContext;

  const form = useForm<ParticipantForm>({
    defaultValues: {
      name: "",
      votes: [],
    },
  });

  const { reset, handleSubmit, control, formState } = form;
  const [selectedParticipantId, setSelectedParticipantId] =
    React.useState<string | undefined>();

  const selectedParticipant = selectedParticipantId
    ? getParticipantInfoById(selectedParticipantId)
    : undefined;

  const [isEditing, setIsEditing] = React.useState(
    !userAlreadyVoted && !poll.closed,
  );

  const formRef = React.useRef<HTMLFormElement>(null);

  const { t } = useTranslation("app");
  const { dayjs } = useDayjs();
  return (
    <FormProvider {...form}>
      <form
        className="mobile:zero-padding border-y bg-white"
        ref={formRef}
        onSubmit={handleSubmit(async (data) => {
          if (selectedParticipant) {
            await onUpdateEntry?.(selectedParticipant.id, data);
            setIsEditing(false);
          } else {
            if (!onEntry) {
              setIsEditing(false);
              return;
            }
            const newParticipant = await onEntry(data);
            setSelectedParticipantId(newParticipant.id);
            setIsEditing(false);
          }
        })}
      >
        <div className="sticky top-12 z-30 flex flex-col space-y-2 border-b bg-gray-50 px-6 py-3">
          <div className="flex space-x-3">
            {!isEditing ? (
              <Listbox
                value={selectedParticipantId}
                onChange={(participantId) => {
                  setSelectedParticipantId(participantId);
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
                      {selectedParticipant ? (
                        <div className="flex items-center space-x-2">
                          <UserAvatar
                            name={selectedParticipant.name}
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
            ) : (
              <div className="grow">
                <Controller
                  name="name"
                  control={control}
                  rules={{ validate: requiredString }}
                  render={({ field }) => (
                    <NameInput
                      disabled={formState.isSubmitting}
                      className={clsx("input w-full", {
                        "input-error": formState.errors.name,
                      })}
                      {...field}
                    />
                  )}
                />
              </div>
            )}
            {isEditing ? (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                {t("cancel")}
              </Button>
            ) : selectedParticipant ? (
              <div className="flex space-x-3">
                <Button
                  icon={<Pencil />}
                  disabled={poll.closed}
                  onClick={() => {
                    setIsEditing(true);
                    reset({
                      name: selectedParticipant.name,
                      votes: selectedParticipant.votes,
                    });
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
                    if (selectedParticipant) {
                      onDeleteEntry?.(selectedParticipant.id);
                    }
                  }}
                />
              </div>
            ) : (
              <Button
                icon={<PlusSm />}
                disabled={poll.closed}
                onClick={() => {
                  reset({
                    name: "",
                    votes: [],
                  });
                  setIsEditing(true);
                }}
              >
                {t("new")}
              </Button>
            )}
          </div>
        </div>
        <GroupedOptions
          selectedParticipantId={selectedParticipantId}
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
        <AnimatePresence initial={false}>
          {isEditing ? (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -100, height: 0 },
                visible: { opacity: 1, y: 0, height: "auto" },
              }}
              initial="hidden"
              animate="visible"
              exit={{
                opacity: 0,
                y: -10,
                height: 0,
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex justify-end border-t bg-gray-50 p-3 sm:rounded-b-xl">
                <Button
                  icon={<Check />}
                  className="w-full sm:w-auto"
                  htmlType="submit"
                  type="primary"
                  loading={formState.isSubmitting}
                >
                  {t("save")}
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
    </FormProvider>
  );
};

export default ListViewPoll;
