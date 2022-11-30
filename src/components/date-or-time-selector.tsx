import clsx from "clsx";
import dayjs from "dayjs";
import produce from "immer";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";

import Plus from "@/components/icons/plus-sm.svg";
import X from "@/components/icons/x.svg";

import { Button } from "./button";
import CompactButton from "./compact-button";
import { DurationPicker } from "./forms/poll-options-form/month-calendar/duration-picker";
import { MultiDateSelect } from "./forms/poll-options-form/month-calendar/multi-date-select";
import { StartTimeInput } from "./forms/poll-options-form/month-calendar/start-time-input";
import { NewPollFormData } from "./types";

const UnsyncedTimeList: React.VoidFunctionComponent = () => {
  const { control } = useFormContext<NewPollFormData>();
  const fields = useWatch({ control, name: "dates" });

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        return (
          <div key={index}>
            <div className="mb-3 font-semibold">
              {dayjs(field.date).format("LL")}
            </div>
            <Controller
              control={control}
              name={`dates.${index}.times`}
              defaultValue={[{ time: "" }]}
              render={({ field }) => {
                return <SyncedTimeList name={field.name} />;
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const SyncedTimeList: React.VoidFunctionComponent<{
  name: "globalTimes" | `dates.${number}.times`;
}> = ({ name }) => {
  const { control } = useFormContext<NewPollFormData>();
  const { errors } = useFormState({ control });
  const { fields, remove, append } = useFieldArray({
    control,
    shouldUnregister: true,
    name,
    rules: {
      required: true,
    },
  });

  const duration = useWatch({ control, name: "duration" });
  const { t } = useTranslation("app");
  return (
    <div className="space-y-3">
      {fields.length > 0 ? (
        <div className="divide-y rounded border">
          {fields.map((time, index) => (
            <div
              key={time.id}
              className="action-group h-10 justify-between px-3"
            >
              <Controller
                control={control}
                name={`${name}.${index}.time`}
                render={({ field }) => {
                  return (
                    <StartTimeInput
                      duration={duration}
                      error={!!errors?.globalTimes?.[index]}
                      {...field}
                    />
                  );
                }}
                rules={{
                  required: true,
                }}
              />
              {fields.length > 1 ? (
                <CompactButton
                  icon={X}
                  onClick={() => {
                    remove(index);
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div>
        <Button
          icon={<Plus />}
          onClick={() => {
            append({ time: "" });
          }}
        >
          {t("addTimeOption")}
        </Button>
      </div>
    </div>
  );
};

const TimeList = () => {
  const { control } = useFormContext<NewPollFormData>();
  const dateSync = useWatch({ name: "shouldUseSameTimeForAllDates", control });
  const dates = useWatch({ control, name: "dates" });
  if (!dates || dates.length === 0) {
    return null;
  }
  return (
    <div className="space-y-3">
      {dateSync ? (
        <Controller
          control={control}
          defaultValue={[{ time: "" }]}
          name="globalTimes"
          render={() => <SyncedTimeList name="globalTimes" />}
        />
      ) : (
        <UnsyncedTimeList />
      )}
    </div>
  );
};

interface DateOrTimeSelectorProps {
  defaultDate?: Date;
}

export const DateOrTimeSelector: React.VoidFunctionComponent<DateOrTimeSelectorProps> =
  ({ defaultDate }) => {
    const { control, setValue, getValues, register } =
      useFormContext<NewPollFormData>();
    const { fields, append, insert, remove } = useFieldArray({
      control,
      name: "dates",
    });
    const { t } = useTranslation("app");
    const duration = useWatch({ control, name: "duration" });
    const { errors } = useFormState({ control });
    return (
      <div className="gap-3 space-y-3 rounded-md border p-3 md:flex md:items-start md:space-x-3 md:space-y-0">
        <div
          className={clsx("md:w-[440px]", {
            "rounded-md ring-1 ring-primary-500 ring-offset-4":
              !!errors.dates?.root,
          })}
        >
          <Controller
            control={control}
            name="dates"
            rules={{
              required: true,
            }}
            render={({ field }) => {
              const dates = field.value.map(({ date }) => date);
              return (
                <MultiDateSelect
                  date={defaultDate}
                  selected={dates}
                  onAddToSelection={(date) => {
                    const index = field.value.findIndex((d) => {
                      return dayjs(d.date).isAfter(date);
                    });
                    const newDate = {
                      date,
                      times: [
                        {
                          time: "",
                        },
                      ],
                    };

                    if (index === -1) {
                      append(newDate);
                    } else {
                      insert(index, newDate);
                    }
                  }}
                  onRemoveFromSelection={(date) => {
                    const index = dates.indexOf(date);
                    remove(index);
                  }}
                />
              );
            }}
          />
        </div>
        <div className="grow space-y-3">
          <div className="action-group">
            <span className="font-semibold">{t("durationLabel")}</span>
            <Controller
              control={control}
              name="duration"
              render={({ field }) => {
                return (
                  <DurationPicker
                    duration={field.value}
                    onChange={(newDuration) => {
                      field.onChange(newDuration);
                    }}
                  />
                );
              }}
            />
          </div>
          {fields.length > 0 && duration > 0 ? (
            <div className="space-y-3">
              <div className="flex h-10 items-center gap-3 rounded border px-3">
                <input
                  id="date-sync"
                  type="checkbox"
                  className="checkbox"
                  {...register("shouldUseSameTimeForAllDates", {
                    onChange: (e) => {
                      if (e.target.checked) {
                        const dates = getValues("dates");
                        const uniqueTimes = new Set<string>();
                        for (const date of dates) {
                          for (const { time } of date.times) {
                            if (time) {
                              uniqueTimes.add(time);
                            }
                          }
                        }
                        setValue(
                          "globalTimes",
                          Array.from(uniqueTimes)
                            .sort()
                            .map((time) => ({ time })),
                        );
                      } else {
                        const { globalTimes, dates } = getValues();
                        setValue(
                          "dates",
                          produce(dates, (dates) => {
                            for (const date of dates) {
                              date.times = [...globalTimes];
                            }
                          }),
                        );
                      }
                    },
                  })}
                />
                <label htmlFor="date-sync">
                  <Trans
                    t={t}
                    i18nKey="useSameTimes"
                    values={{ count: fields.length }}
                    components={{ b: <strong /> }}
                  />
                </label>
              </div>
              <TimeList />
            </div>
          ) : null}
        </div>
      </div>
    );
  };
