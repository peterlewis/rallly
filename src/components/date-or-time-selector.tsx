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
import { GroupedList } from "./grouped-list";
import { NewPollFormData } from "./types";

const DateList: React.VoidFunctionComponent = () => {
  const { control, setValue } = useFormContext<NewPollFormData>();
  return (
    <Controller
      control={control}
      name="dates"
      render={({ field }) => {
        const dates = field.value.map((date, index) => ({ ...date, index }));
        return (
          <GroupedList
            data={dates}
            className="space-y-3"
            groupDefs={[
              {
                groupBy(a) {
                  return a.date.substring(0, 7);
                },
                itemsClassName: "border divide-y rounded bg-white",
                render({ value }) {
                  return (
                    <div className="mb-3 font-semibold">
                      {dayjs(value).format("MMMM YYYY")}
                    </div>
                  );
                },
              },
            ]}
            itemRender={({ item }) => {
              return (
                <div className="action-group h-12 justify-between px-3 py-1">
                  <div>
                    <span className="font-semibold">
                      {dayjs(item.date).format("D")}
                    </span>
                    <span className="text-gray-400">
                      {dayjs(item.date).format(" dddd")}
                    </span>
                  </div>
                  <CompactButton
                    icon={X}
                    onClick={() => {
                      setValue(
                        "dates",
                        produce(dates, (draft) => {
                          draft.splice(item.index, 1);
                        }),
                      );
                    }}
                  />
                </div>
              );
            }}
          />
        );
      }}
    />
  );
};

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
    const { control, register } = useFormContext<NewPollFormData>();
    const { fields, append, insert, remove } = useFieldArray({
      control,
      name: "dates",
    });
    const { t } = useTranslation("app");
    const duration = useWatch({ control, name: "duration" });
    // sort value
    return (
      <div className="sm:rounded-md sm:border md:flex mobile:space-y-4">
        <div className="sm:p-4 md:w-[440px]">
          <Controller
            control={control}
            name="dates"
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
        <div className="grow space-y-3 sm:p-4">
          <div className="action-group">
            <span className="font-semibold">Duration:</span>
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
          {fields.length > 1 && duration > 0 ? (
            <div className="rounded border px-3">
              <div className="flex h-10 items-center gap-3">
                <input
                  id="date-sync"
                  type="checkbox"
                  className="checkbox"
                  {...register("shouldUseSameTimeForAllDates")}
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
            </div>
          ) : null}
          {duration === 0 ? <DateList /> : <TimeList />}
        </div>
      </div>
    );
  };
