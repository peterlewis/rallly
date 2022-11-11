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
import { GroupedList } from "../../../grouped-list";
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
import { StartTimeInput } from "./start-time-input";
import { TimeSlotPicker } from "./time-slot-picker";
import { TimeSlotValue } from "./types";

type Event = {
  start: string;
  duration: number;
};

const TimeSlotGroup: React.VoidFunctionComponent<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="rounded-md border">
      <div className="flex h-14 items-center justify-between gap-4 border-b p-3">
        <div className="px-1 font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
};

const DateList: React.VoidFunctionComponent<{
  value: Event[];
  onChange: (value: Event[]) => void;
}> = ({ value, onChange }) => {
  return (
    <GroupedList
      data={value}
      groupDefs={[
        {
          groupBy(event) {
            return event.start.substring(0, 7);
          },
          render({ value }) {
            return <div>{dayjs(value).format("MMMM YYYY")}</div>;
          },
        },
      ]}
      itemRender={({ item, index }) => {
        return (
          <div className="flex items-center">
            {dayjs(item.start).format("D dddd")}
            <CompactButton
              icon={X}
              onClick={() => {
                onChange(
                  produce(value, (draft) => {
                    draft.splice(index, 1);
                  }),
                );
              }}
            />
          </div>
        );
      }}
    />
  );
};

const MonthCalendar: React.VoidFunctionComponent<{
  title?: string;
  dates?: string[];
  options: DateTimeOption[];
  date: Date;
  value: string[];
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

  const [duration, setDuration] = React.useState<number>(0);
  const [times, setTimes] = React.useState<TimeSlotValue[]>([]);

  return (
    <div className="space-y-3 rounded-md border">
      <div className="flex items-center gap-3 border-b p-3">
        <div className="font-semibold">Duration:</div>
        <DurationPicker
          duration={duration}
          onChange={(newDuration) => {
            if (newDuration === 0) {
              onChange?.(
                datepicker.selection.map((date) => ({
                  type: "date",
                  date,
                })),
              );
            } else {
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
      <div className="flex flex-col md:flex-row">
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
        <div className="flex grow flex-col space-y-3 p-4">
          {options.length === 0 ? (
            <EmptyState
              className="flex grow items-center justify-center"
              icon={Calendar}
              text={t("noDatesSelected")}
            />
          ) : (
            <div className="space-y-3">
              {duration === 0 ? (
                <DateList
                  value={datepicker.selection.map((date) => {
                    return {
                      start: `${date}T00:00:00`,
                      duration: 0,
                    };
                  })}
                  onChange={(events) => {
                    // onChange?.
                  }}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
