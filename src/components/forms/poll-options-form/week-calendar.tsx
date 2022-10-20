import clsx from "clsx";
import dayjs from "dayjs";
import React from "react";
import { Calendar } from "react-big-calendar";
import { useMount } from "react-use";

import { getDuration } from "../../../utils/date-time-utils";
import { useDayjs } from "../../../utils/dayjs";
import { useWideScreen } from "../../../utils/use-wide-screen";
import DateNavigationToolbar from "./date-navigation-toolbar";
import dayjsLocalizer from "./dayjs-localizer";
import { DateTimeOption, DateTimePickerProps } from "./types";
import { toIsoDate, toIsoDateTime } from "./utils";

const localizer = dayjsLocalizer(dayjs);

const WeekCalendar: React.VoidFunctionComponent<DateTimePickerProps> = ({
  title,
  options,
  onNavigate,
  date,
  onChange,
  duration,
  onChangeDuration,
}) => {
  const [scrollToTime, setScrollToTime] = React.useState<Date>();

  const { timeFormat } = useDayjs();
  useMount(() => {
    // Bit of a hack to force rbc to scroll to the right time when we close/open a modal
    setScrollToTime(dayjs(date).add(-60, "minutes").toDate());
  });

  const isWidescreen = useWideScreen();

  return (
    <Calendar
      key={timeFormat}
      events={options.map((option) => {
        if (option.type === "date") {
          return { title, start: new Date(option.date) };
        } else {
          return {
            title,
            start: new Date(option.start),
            end: new Date(option.end),
          };
        }
      })}
      culture="default"
      onNavigate={onNavigate}
      date={date}
      className="w-full"
      view={isWidescreen ? "week" : "day"}
      views={["day", "week"]}
      selectable={true}
      localizer={localizer}
      onSelectEvent={(event) => {
        onChange(
          options.filter(
            (option) =>
              !(
                option.type === "time" &&
                option.start === toIsoDateTime(event.start) &&
                event.end &&
                option.end === toIsoDateTime(event.end)
              ),
          ),
        );
      }}
      components={{
        toolbar: function Toolbar(props) {
          return (
            <DateNavigationToolbar
              year={props.date.getFullYear()}
              label={props.label}
              onPrevious={() => {
                props.onNavigate("PREV");
              }}
              onToday={() => {
                props.onNavigate("TODAY");
              }}
              onNext={() => {
                props.onNavigate("NEXT");
              }}
            />
          );
        },
        eventWrapper: function EventWrapper(props) {
          // TODO (Luke Vella) [2022-07-15]: it looks like it's possible that end
          // can be undefined here but maybe that shouldn't be the case.
          const { start, end } = props.event;
          return (
            <div
              // onClick prop doesn't work properly. Seems like some other element is cancelling the event before it reaches this element
              onMouseUp={props.onClick}
              className="absolute ml-1 max-h-full overflow-hidden rounded-md bg-primary-100 p-1 text-xs text-primary-500 transition-colors"
              style={{
                top: `calc(${props.style?.top}% + 4px)`,
                height: `calc(${props.style?.height}% - 8px)`,
                left: `${props.style?.xOffset}%`,
                width: `calc(${props.style?.width}%)`,
              }}
            >
              <div>{dayjs(start).format("LT")}</div>
              <div className="font-semibold">
                {getDuration(start, end ?? start)}
              </div>
            </div>
          );
        },
        week: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          header: function Header({ date }: any) {
            const dateString = toIsoDate(date);
            const selectedOption = options.find((option) => {
              return option.type === "date" && option.date === dateString;
            });
            return (
              <span
                onClick={() => {
                  if (!selectedOption) {
                    onChange([
                      ...options,
                      {
                        type: "date",
                        date: toIsoDate(date),
                      },
                    ]);
                  } else {
                    onChange(
                      options.filter((option) => option !== selectedOption),
                    );
                  }
                }}
                className={clsx(
                  "inline-flex w-full items-center justify-center rounded-md py-2 text-sm hover:bg-slate-50 hover:text-gray-700",
                  {
                    "bg-primary-50 text-primary-600 hover:bg-primary-50 hover:bg-opacity-75 hover:text-primary-600":
                      !!selectedOption,
                  },
                )}
              >
                <span className="mr-1 font-normal opacity-50">
                  {dayjs(date).format("ddd")}
                </span>
                <span className="font-medium">{dayjs(date).format("DD")}</span>
              </span>
            );
          },
        },
        timeSlotWrapper: function TimeSlotWrapper({ children }) {
          return <div className="h-8 text-xs text-gray-500">{children}</div>;
        },
      }}
      step={15}
      onSelectSlot={({ start, end, action }) => {
        // on select slot
        const startDate = new Date(start);
        const endDate = new Date(end);

        const newEvent: DateTimeOption = {
          type: "time",
          start: toIsoDateTime(startDate),
          end: toIsoDateTime(endDate),
        };

        if (action === "select") {
          const diff = dayjs(endDate).diff(startDate, "minutes");
          if (diff < 60 * 24) {
            onChangeDuration(diff);
          }
        } else {
          newEvent.end = toIsoDateTime(
            dayjs(startDate).add(duration, "minutes").toDate(),
          );
        }

        const alreadyExists = options.some(
          (option) =>
            option.type === "time" &&
            option.start === newEvent.start &&
            option.end === newEvent.end,
        );

        if (!alreadyExists) {
          onChange([...options, newEvent]);
        }
      }}
      scrollToTime={scrollToTime}
    />
  );
};

export default WeekCalendar;
