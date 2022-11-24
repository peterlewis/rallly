import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { getBrowserTimeZone } from "../../../utils/date-time-utils";
import { useDayjs } from "../../../utils/dayjs";
import { Button } from "../../button";
import { ScoreSummary } from "../../poll/score-summary";
import { useVoteState, VoteSelector } from "../../poll/vote-selector";
import { useUser } from "../../user-provider";
import { EventDetails } from "./event-details";
import { OptionMultiSelect } from "./option-multi-select";
import { ParticipantsContextProvider } from "./participants-context";
import { usePoll, usePollOptions } from "./poll-context";
import { PollOption } from "./poll-option";
import { PollResults } from "./poll-results";
import { StyledList } from "./styled-list";
import { useTargetTimezone } from "./target-timezone";

type Option = {
  vote?: VoteType;
  id: string;
};

type FirstStepForm = {
  value: Option[];
};

export const FirstStep: React.VoidFunctionComponent<{
  votes?: Record<string, VoteType>;
  onSubmit: (value: FirstStepForm) => void;
}> = ({ votes, onSubmit }) => {
  const { t } = useTranslation("app");
  const data = usePoll();

  const { dayjs } = useDayjs();

  const [targetTimezone] = useTargetTimezone();

  const [defaultValue] = React.useState<Option[]>(
    () =>
      data.options.map((o) => {
        return {
          id: o.id,
          // value: votes?.[o.id],
        };
      }) ?? [],
  );

  const { control, handleSubmit } = useForm<FirstStepForm>({
    defaultValues: {
      value: defaultValue,
    },
  });

  const { user } = useUser();

  const { options } = usePollOptions();

  const participant = React.useMemo(() => {
    // return data.participants.find(({ userId }) => userId === user.id);
    return undefined;
  }, [data, user]);

  const { toggle } = useVoteState();

  return (
    <ParticipantsContextProvider
      seed={data.id}
      participants={data.participants}
    >
      <div className="space-y-4">
        <EventDetails />
        {/* <PollResults
          className="relative min-h-0 overflow-auto p-3"
          options={data.options.map((o, index) => {
            return {
              ...o,
              start: data.timeZone
                ? dayjs(o.start)
                    .tz(data.timeZone, true)
                    .tz(targetTimezone)
                    .format("YYYY-MM-DDTHH:mm:ss")
                : o.start,
              index,
            };
          })}
        /> */}
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          <StyledList
            className="border-t"
            options={data.options}
            itemRender={({ item, index }) => {
              return (
                <Controller
                  control={control}
                  name={`value.${index}`}
                  render={({ field }) => {
                    const vote = field.value.vote;
                    const { score } = options[item.id];
                    return (
                      <PollOption
                        optionId={item.id}
                        onChange={(v) => {
                          field.onChange({ ...field.value, vote: v });
                        }}
                        vote={vote}
                        score={score}
                      />
                    );
                  }}
                />
              );
            }}
          />
          <div className="flex border-t p-3">
            <Button
              htmlType="submit"
              size="lg"
              className="w-full"
              type="primary"
            >
              {t("continue")}
            </Button>
          </div>
        </form>
      </div>
    </ParticipantsContextProvider>
  );
};
