import clsx from "clsx";

import ChevronLeft from "@/components/icons/chevron-left.svg";
import ChevronRight from "@/components/icons/chevron-right.svg";

import { Button } from "../../../button";
import {
  HeadlessDatePickerOptions,
  useHeadlessDatePicker,
} from "../../../headless-date-picker";

export const MultiDateSelect: React.VoidFunctionComponent<HeadlessDatePickerOptions> =
  ({
    selected,
    onAddToSelection,
    onRemoveFromSelection,
    onNavigationChange,
    weekStartsOn,
    date,
  }) => {
    const datepicker = useHeadlessDatePicker({
      selected,
      onNavigationChange,
      weekStartsOn,
      date,
      onAddToSelection,
      onRemoveFromSelection,
    });

    return (
      <div className="flex w-full flex-col">
        <div className="mb-3 flex items-center justify-center space-x-4">
          <Button
            icon={<ChevronLeft />}
            title="Previous month"
            onClick={datepicker.prev}
          />
          <div className="grow text-center text-lg font-medium">
            {datepicker.label}
          </div>
          <Button
            title="Next month"
            icon={<ChevronRight />}
            onClick={datepicker.next}
          />
        </div>
        <div className="grid grid-cols-7">
          {datepicker.daysOfWeek.map((dayOfWeek) => {
            return (
              <div
                key={dayOfWeek}
                className="flex items-center justify-center pb-2 text-sm font-medium text-gray-400"
              >
                {dayOfWeek.substring(0, 2)}
              </div>
            );
          })}
        </div>
        <div className="grid grow grid-cols-7 overflow-hidden rounded-lg border bg-white shadow-sm">
          {datepicker.days.map((day, i) => {
            return (
              <button
                type="button"
                key={i}
                onClick={() => {
                  datepicker.toggle(day.date);
                }}
                className={clsx(
                  "relative flex h-12 items-center justify-center text-sm focus:ring-0 focus:ring-offset-0 hover:bg-gray-50 active:bg-gray-100",
                  {
                    "bg-gray-50 text-gray-400": day.outOfMonth && !day.selected,
                    "font-semibold before:absolute before:-z-0 before:h-9 before:w-9 before:rounded-full before:border before:border-dashed before:border-primary-400":
                      day.today,
                    "border-r": (i + 1) % 7 !== 0,
                    "border-b": i < datepicker.days.length - 7,
                    "text-white after:absolute after:-z-0 after:h-8 after:w-8 after:rounded-full after:bg-primary-500 after:content-['']":
                      day.selected,
                  },
                )}
              >
                <span className="z-10">{day.day}</span>
              </button>
            );
          })}
        </div>
        <Button className="mt-3" onClick={datepicker.today}>
          Today
        </Button>
      </div>
    );
  };
