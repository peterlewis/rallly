import clsx from "clsx";
import dayjs from "dayjs";
import produce from "immer";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { useDayjs } from "../../../../utils/dayjs";
import { Button } from "../../../button";
import CompactButton from "../../../compact-button";
import Dropdown, { DropdownItem } from "../../../dropdown";
import { EmptyState } from "../../../empty-state";
import { useHeadlessDatePicker } from "../../../headless-date-picker";
import Calendar from "../../../icons/calendar.svg";
import DotsHorizontal from "../../../icons/dots-horizontal.svg";
import Magic from "../../../icons/magic.svg";
import PlusSm from "../../../icons/plus-sm.svg";
import Trash from "../../../icons/trash.svg";
import X from "../../../icons/x.svg";
import Switch from "../../../switch";
import { DurationValue, TimeOption } from "..";
import { DateTimeOption, DateTimePickerProps } from "../types";
import { isoDateTimeFormat } from "../utils";
import { DurationPicker } from "./duration-picker";
import { MultiDateSelect } from "./multi-date-select";
import { TimeSlotPicker } from "./time-slot-picker";

type TimeSlotValue = [string, string];

const TimeSlotList: React.VoidFunctionComponent<{
  title: string;
  date: string;
  times: TimeSlotValue[];
  onChange?: (times: TimeSlotValue[]) => void;
  defaultDuration: DurationValue;
}> = ({ title, times, date, defaultDuration, onChange }) => {
  const handleChange = (newTimes: TimeSlotValue[]) => {
    onChange?.(newTimes);
  };

  const { t } = useTranslation("app");
  return (
    <div className="rounded-md border">
      <div className="flex h-14 items-center justify-between gap-4 border-b p-3">
        <div className="px-1 font-semibold">{title}</div>
        {/* {duration !== "allDay" ? (
          <Button
            icon={<PlusSm />}
            onClick={() => {
              const lastOption = times[times.length - 1];
              let newStart: string;
              let newEnd: string;
              if (lastOption) {
                const end = dayjs(lastOption[1]);

                let newEndDay = end.add(duration, "minutes");

                if (!newEndDay.isSame(end, "day")) {
                  newStart = lastOption[0];
                  newEndDay = end.set("hour", 23).set("minute", 59);
                } else {
                  newStart = lastOption[1];
                }
                newEnd = newEndDay.format("YYYY-MM-DDTHH:mm:ss");
              } else {
                newStart = `${date}T08:00`;
                newEnd = `${date}T09:00`;
              }
              handleChange(
                produce(times, (draft) => {
                  draft.push([newStart, newEnd]);
                }),
              );
            }}
          >
            {t("addTimeOption")}
          </Button>
        ) : null} */}
      </div>
      {times.length > 0 ? (
        <div className="space-y-3 p-3">
          {times.map((time, i) => {
            return (
              <div className="flex items-center gap-3" key={i}>
                <TimeSlotPicker
                  value={time}
                  onChange={(newTime) => {
                    handleChange(
                      produce(times, (draft) => {
                        draft[i] = newTime;
                      }),
                    );
                  }}
                />
                <CompactButton
                  icon={X}
                  onClick={() => {
                    handleChange(
                      produce(times, (draft) => {
                        draft.splice(i, 1);
                      }),
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {defaultDuration > 0 ? (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div>Start at:</div>
            <div>
              <input type="time" className="input" />
            </div>
            <div></div>
          </div>
        </div>
      ) : (
        <div className="flex grow items-center justify-center p-4">
          <div className="rounded-md border border-dashed p-3 text-gray-400">
            All-day event
          </div>
        </div>
      )}
    </div>
  );
};

const MonthCalendar: React.VoidFunctionComponent<{
  title?: string;
  dates?: string[];
  options: DateTimeOption[];
  syncDates?: boolean;
  date: Date;
  onNavigate?: (date: Date) => void;
  onChange?: (options: DateTimeOption[]) => void;
}> = ({ options = [], onNavigate, date = new Date(), onChange }) => {
  const { t } = useTranslation("app");
  const optionsByDay = React.useMemo(() => {
    const res: Record<
      string,
      [
        {
          option: DateTimeOption;
          index: number;
        },
      ]
    > = {};

    options.forEach((option, index) => {
      const dateString =
        option.type === "date"
          ? option.date
          : option.start.substring(0, option.start.indexOf("T"));

      if (res[dateString]) {
        res[dateString].push({ option, index });
      } else {
        res[dateString] = [{ option, index }];
      }
    });

    return res;
  }, [options]);

  const { weekStartsOn } = useDayjs();

  const datepicker = useHeadlessDatePicker({
    selected: Object.keys(optionsByDay),
    onNavigationChange: onNavigate,
    weekStartsOn,
    date,
  });

  const removeAllOptionsForDay = React.useCallback(
    (dateToRemove: string) => {
      onChange?.(
        options.filter((option) => {
          const optionDate =
            option.type === "date" ? option.date : option.start;
          return !optionDate.includes(dateToRemove);
        }),
      );
    },
    [onChange, options],
  );

  // const duration = React.useMemo(() => {
  //   switch (true) {
  //     case options.length === 0 || options[0].type === "date":
  //       return "allDay";
  //   }
  // }, [options]);

  const [duration, setDuration] = React.useState<number>(0);
  const [times, setTimes] = React.useState<TimeSlotValue[]>([]);

  return (
    <div className="flex flex-col rounded-md border bg-white md:h-[460px] md:flex-row md:divide-x">
      <div className="p-4 md:w-[440px] md:shrink-0">
        <MultiDateSelect
          selected={datepicker.selection}
          weekStartsOn={weekStartsOn}
          onAddToSelection={(newDateString) => {
            let newOption: DateTimeOption;
            if (duration !== 0) {
              const start = `${newDateString}T08:00:00`;
              newOption = {
                type: "time",
                start,
                end: dayjs(start)
                  .add(duration, "minutes")
                  .format(isoDateTimeFormat),
              };
            } else {
              newOption = {
                type: "date",
                date: newDateString,
              };
            }

            onChange?.([...options, newOption]);
            onNavigate?.(new Date(newDateString));
          }}
          onRemoveFromSelection={removeAllOptionsForDay}
          onNavigationChange={onNavigate}
          date={date}
        />
      </div>
      <div className="grow space-y-3 overflow-auto p-4">
        {options.length === 0 ? (
          <EmptyState icon={Calendar} text={t("noDatesSelected")} />
        ) : (
          <>
            <div className="flex h-10 items-center gap-3">
              <div className="font-semibold">Duration:</div>
              <DurationPicker
                duration={duration}
                onChange={(newDuration) => {
                  if (newDuration === 0) {
                    setTimes([]);
                  } else if (typeof newDuration === "number") {
                    onChange?.(
                      options.map((option) => {
                        if (option.type === "date") {
                          const start = dayjs(option.date).hour(8);
                          return {
                            type: "time",
                            start: start.format("YYYY-MM-DDTHH:mm:ss"),
                            end: start
                              .add(newDuration, "minutes")
                              .format("YYYY-MM-DDTHH:mm:ss"),
                          };
                        } else {
                          const start = dayjs(option.start);
                          return {
                            type: "time",
                            start: option.start,
                            end: start
                              .add(newDuration, "minutes")
                              .format("YYYY-MM-DDTHH:mm:ss"),
                          };
                        }
                      }),
                    );
                  }
                  setDuration(newDuration); // TODO (Luke Vella) [2022-11-09]: Don't need this. should infer this from list of options
                }}
              />
            </div>
            <TimeSlotList
              times={times}
              title={t("dateCount", { count: datepicker.selection.length })}
              date={datepicker.selection[0]}
              onChange={(newTimes) => {
                setTimes(newTimes);
                if (newTimes.length === 0) {
                  onChange?.(
                    datepicker.selection.map((date) => ({
                      type: "date",
                      date,
                    })),
                  );
                } else {
                  const newOptions: TimeOption[] = [];
                  for (let i = 0; i < datepicker.selection.length; i++) {
                    for (let j = 0; j < newTimes.length; j++) {
                      const [startTime, endTime] = newTimes[j];
                      const date = datepicker.selection[i];
                      const start = `${date}T${startTime.substring(11)}`;
                      const end = `${date}T${endTime.substring(11)}`;
                      newOptions.push({ type: "time", start, end });
                    }
                  }
                  onChange?.(newOptions);
                }
              }}
              defaultDuration={duration}
            />
            <div className="text-center">
              <Button
                onClick={() => {
                  // set syncDates
                }}
              >
                Set different times for each date
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthCalendar;
