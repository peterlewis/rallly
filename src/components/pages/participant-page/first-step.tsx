import { VoteType } from "@prisma/client";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { getBrowserTimeZone } from "../../../utils/date-time-utils";
import { useDayjs } from "../../../utils/dayjs";
import { Button } from "../../button";
import { usePoll } from "../participant-page";
import { OptionMultiSelect } from "./option-multi-select";

const throwIfUndefined = <T,>(data: T | undefined) => {
  if (data === undefined) {
    throw new Error("Expected data byt got undefined");
  }
  return data;
};

type Option = {
  start: string;
  duration: number;
  value?: VoteType;
  id: string;
  index: number;
};

type FirstStepForm = {
  value: Array<Option>;
};

export const FirstStep: React.VoidFunctionComponent<{
  votes?: Record<string, VoteType>;
  onSubmit: (value: FirstStepForm) => void;
}> = ({ votes, onSubmit }) => {
  const { t } = useTranslation("app");
  const res = usePoll();
  const data = throwIfUndefined(res.data);

  const { dayjs } = useDayjs();

  const [targetTimezone, setTargetTimezone] =
    React.useState(getBrowserTimeZone);

  const [defaultValue] = React.useState<Option[]>(
    () =>
      data?.options.map((o, index) => {
        return {
          ...o,
          start: data.timeZone
            ? dayjs(o.start)
                .tz(data.timeZone, true)
                .tz(targetTimezone)
                .format("YYYY-MM-DDTHH:mm:ss")
            : o.start,
          index,
          value: votes?.[o.id],
        };
      }) ?? [],
  );

  const { control, handleSubmit } = useForm<FirstStepForm>({
    defaultValues: {
      value: defaultValue,
    },
  });

  return (
    <form
      className="flex h-full max-h-[calc(100vh-100px)] flex-col space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="shrink-0">
        <div className="mb-3">
          <h1 className="mb-0 text-2xl font-bold">{data.title}</h1>
          <div className="text-slate-700/40">
            <Trans
              t={t}
              i18nKey="createdBy"
              values={{ name: data.user?.name ?? t("guest") }}
              components={{ b: <span /> }}
            />
          </div>
        </div>
        <p className="text-slate-700/90">{data.description}</p>
        <div>
          <strong>{data.location}</strong>
        </div>
        {data.timeZone ? (
          <div>
            <strong>{targetTimezone}</strong>
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-col space-y-3">
        <Controller
          control={control}
          name="value"
          render={({ field }) => (
            <OptionMultiSelect
              className="relative -mx-3 min-h-0 overflow-auto rounded border"
              options={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex">
          <Button htmlType="submit" type="primary">
            {t("continue")}
          </Button>
        </div>
      </div>
    </form>
  );
};
