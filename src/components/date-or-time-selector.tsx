import { render } from "@headlessui/react/dist/utils/render";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";
import React from "react";

import { useDayjs } from "../utils/dayjs";
import MonthCalendar from "./forms/poll-options-form/month-calendar";
import { MultiDateSelect } from "./forms/poll-options-form/month-calendar/multi-date-select";
import { GroupedList } from "./grouped-list";
import { useHeadlessDatePicker } from "./headless-date-picker";

interface DateOrTimeSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  defaultDate?: Date;
  duration: number;
}

export const DateOrTimeSelector: React.VoidFunctionComponent<DateOrTimeSelectorProps> =
  ({ value = [], onChange, defaultDate, duration }) => {
    // sort value
    const sortedValue = value.sort();
    // get list of unique dates from the list of times
    const timesByDate = groupBy(sortedValue, (time) => time.substring(0, 10));

    return (
      <div className="flex rounded-md border">
        <div className="w-[440px] p-4">
          <MultiDateSelect
            selected={Object.keys(timesByDate)}
            onAddToSelection={(date) => {
              onChange?.([...value, `${date}T08:00:00`]);
            }}
            onRemoveFromSelection={(date) => {
              onChange?.(
                value.filter((time) => {
                  return !time.includes(date);
                }),
              );
            }}
          />
        </div>
        <div className="grow p-4">
          {duration === 0 ? (
            <GroupedList
              data={sortedValue}
              groupDefs={[
                {
                  groupBy(a) {
                    return a.substring(0, 7);
                  },
                  render({ value }) {
                    return <div>{dayjs(value).format("MMMM YYYY")}</div>;
                  },
                },
              ]}
              itemRender={({ item }) => {
                return <div>{dayjs(item).format("D dddd")}</div>;
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };
