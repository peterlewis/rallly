import { Participant } from "@prisma/client";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  decodeOptions,
  encodeDateOption,
  parseValue,
} from "../../utils/date-time-utils";
import { Button } from "../button";
import { DateOrTimeSelector } from "../date-or-time-selector";
import { PollOptionsForm } from "../forms";
import { DateTimeOption } from "../forms/poll-options-form/types";
import { useModalContext } from "../modal/modal-provider";
import { useParticipants } from "../participants-provider";
import { usePoll } from "../poll-provider";
import { usePollMutations } from "../use-poll-mutations";

const formId = "update-options";

export const Options: React.VFC = () => {
  const { poll } = usePoll();

  const { participants } = useParticipants();

  const participantsByOptionId = React.useMemo(() => {
    return poll.options.reduce<Record<string, Participant[]>>((acc, option) => {
      acc[option.id] = participants.filter((participant) =>
        participant.votes.some(
          ({ type, optionId }) => optionId === option.id && type === "yes",
        ),
      );
      return acc;
    }, {});
  }, [participants, poll.options]);

  const getParticipantsWhoVotedForOption = (optionId: string) =>
    participantsByOptionId[optionId];

  const firstOption = parseValue(poll.options[0].value);
  const navigationDate =
    firstOption.type === "date" ? firstOption.date : firstOption.start;

  const { updatePoll } = usePollMutations();
  const { t } = useTranslation("app");
  const modalContext = useModalContext();

  const [defaultPollValue] = React.useState(() => {
    return poll.options.map((option) => parseValue(option.value));
  });

  const { control, handleSubmit } = useForm<{ options: DateTimeOption[] }>();

  return (
    <form>
      <Controller
        control={control}
        name="options"
        defaultValue={defaultPollValue}
        render={({ field }) => {
          return (
            <DateOrTimeSelector
              defaultDate={new Date(navigationDate)}
              value={field.value}
              onChange={field.onChange}
            />
          );
        }}
      />
      <div className="flex py-3">
        <Button
          htmlType="submit"
          type="primary"
          loading={updatePoll.isLoading}
          form={formId}
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
};
