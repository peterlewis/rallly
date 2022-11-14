import dayjs from "dayjs";
import produce from "immer";
import groupBy from "lodash/groupBy";
import uniq from "lodash/uniq";
import React from "react";

import Plus from "@/components/icons/plus.svg";
import X from "@/components/icons/x.svg";

import {
  createTimestamp,
  getDateFromTimestamp,
  getTimeFromTimestamp,
  setTimeForTimestamp,
} from "../utils/date-time-utils";
import CompactButton from "./compact-button";
import { MultiDateSelect } from "./forms/poll-options-form/month-calendar/multi-date-select";
import { StartTimeInput } from "./forms/poll-options-form/month-calendar/start-time-input";
import { GroupedList } from "./grouped-list";

const DateList: React.VoidFunctionComponent<{
  dates: string[];
  onChange: (dates: string[]) => void;
}> = ({ dates, onChange }) => {
  return (
    <GroupedList
      data={dates}
      className="space-y-3"
      groupDefs={[
        {
          groupBy(a) {
            return a.substring(0, 7);
          },
          className: "border rounded shadow-sm",
          itemsClassName: "py-2",
          render({ value }) {
            return (
              <div className="border-b py-2 px-3 font-semibold">
                {dayjs(value).format("MMMM YYYY")}
              </div>
            );
          },
        },
      ]}
      itemRender={({ item }) => {
        return (
          <div className="action-group px-3 py-1">
            <div>{dayjs(item).format("D dddd")}</div>
            <CompactButton
              icon={X}
              onClick={() => {
                onChange(
                  produce(dates, (draft) => {
                    draft.splice(dates.indexOf(item), 1);
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

const GroupedTimeList: React.VoidFunctionComponent<{
  timestamps: string[];
  duration: number;
  onChange: (timestamps: string[]) => void;
}> = ({ timestamps, duration, onChange }) => {
  return (
    <GroupedList
      data={timestamps}
      className="space-y-3"
      groupDefs={[
        {
          groupBy(a) {
            return a.substring(0, 10);
          },
          className: "border rounded",
          itemsClassName: "px-3 py-1",
          render({ value, items }) {
            return (
              <div className="action-group border-b px-3 py-2">
                <div className="font-semibold">{dayjs(value).format("LL")}</div>
                <CompactButton
                  icon={Plus}
                  onClick={() => {
                    const lastTime = dayjs(items[items.length - 1]);
                    let newStart = lastTime.add(duration, "minutes");
                    if (!newStart.isSame(lastTime, "day")) {
                      newStart = lastTime;
                    }
                    onChange([
                      ...timestamps,
                      newStart.format("YYYY-MM-DDTHH:mm:ss"),
                    ]);
                  }}
                />
              </div>
            );
          },
        },
      ]}
      itemRender={({ item: timestamp }) => {
        return (
          <div className="action-group">
            <StartTimeInput
              value={getTimeFromTimestamp(timestamp)}
              duration={duration}
              onChange={(newTime) => {
                onChange(
                  produce(timestamps, (draft) => {
                    draft[timestamps.indexOf(timestamp)] = setTimeForTimestamp(
                      timestamp,
                      newTime,
                    );
                  }),
                );
              }}
            />
            <CompactButton
              icon={X}
              onClick={() => {
                onChange(
                  produce(timestamps, (draft) => {
                    draft.splice(timestamps.indexOf(timestamp), 1);
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

const getUniqueDatesAndTimes = (timestamps: string[]) => {
  const res: Record<string, string[]> = {};
  timestamps.forEach((timestamp) => {
    const date = getDateFromTimestamp(timestamp);
    const time = getTimeFromTimestamp(timestamp);
    const times = res[date] ?? [];
    times.push(time);
    res[date] = times;
  });
  const dates = Object.keys(res);
  const timeSet = res[dates[0]];
  return {
    dates: dates,
    times: timeSet ?? [],
  };
};

const SyncedTimeList: React.VoidFunctionComponent<{
  timestamps: string[];
  duration: number;
  onChange: (timestamps: string[]) => void;
}> = ({ timestamps, duration, onChange }) => {
  const unique = React.useMemo(() => {
    return getUniqueDatesAndTimes(timestamps);
  }, [timestamps]);

  const addTimeToAllDates = (newTime: string) => {
    onChange([
      ...timestamps,
      ...unique.dates.map((date) => createTimestamp(date, newTime)),
    ]);
  };

  const [isAddingTime, setAddingTime] = React.useState(false);
  return (
    <div className="rounded border">
      {unique.dates.length > 0 ? (
        <div className="action-group border-b px-3 py-2">
          <div className="font-semibold">
            {unique.dates.length === 1
              ? dayjs(unique.dates[0]).format("LL")
              : `${unique.dates.length} dates selected`}
          </div>
          {!isAddingTime ? (
            <CompactButton
              icon={Plus}
              onClick={() => {
                setAddingTime(true);
                // const lastTime = dayjs(
                //   createTimestamp(
                //     unique.dates[0],
                //     unique.times[unique.times.length - 1] ?? "08:00",
                //   ),
                // );
                // let newStart = lastTime.add(duration, "minutes");
                // if (!newStart.isSame(lastTime, "day")) {
                //   newStart = lastTime;
                // }
                // const newStartTime = newStart.format("HH:mm");
                // onChange([
                //   ...timestamps,
                //   ...unique.dates.map((date) =>
                //     createTimestamp(date, newStartTime),
                //   ),
                // ]);
              }}
            />
          ) : null}
        </div>
      ) : null}
      <div className="py-1 px-3">
        {unique.times.map((time, index) => (
          <div key={`${index}-${time}`} className="action-group">
            <StartTimeInput
              value={time}
              duration={duration}
              onChange={(newTime) => {
                if (!unique.times.includes(newTime)) {
                  onChange(
                    produce(timestamps, (draft) => {
                      const timesCount = unique.times.length;
                      for (let x = 0; x < unique.dates.length; x++) {
                        draft[x * timesCount + index] = setTimeForTimestamp(
                          unique.dates[x],
                          newTime,
                        );
                      }
                    }),
                  );
                } else {
                  onChange([...timestamps]);
                }
              }}
            />
            <CompactButton
              icon={X}
              onClick={() => {
                onChange(
                  timestamps.filter((timestamp) => !timestamp.includes(time)),
                );
              }}
            />
          </div>
        ))}
        {isAddingTime ? (
          <div className="action-group">
            <StartTimeInput
              value=""
              autoFocus={true}
              duration={duration}
              onChange={(newTime) => {
                if (newTime) {
                  addTimeToAllDates(newTime);
                }
                setAddingTime(false);
              }}
            />
            <CompactButton
              icon={X}
              onClick={() => {
                setAddingTime(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TimeList: React.VoidFunctionComponent<{
  timestamps: string[];
  onChange: (times: string[]) => void;
  duration: number;
}> = ({ timestamps, onChange, duration }) => {
  const [dateSync, setDateSync] = React.useState(() => {
    // check if all dates are in sync
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          id="date-sync"
          type="checkbox"
          className="checkbox"
          checked={dateSync}
          onChange={(e) => {
            setDateSync(e.target.checked);
            const unique = getUniqueDatesAndTimes(timestamps);
            const newTimestamps: string[] = [];
            for (let x = 0; x < unique.dates.length; x++) {
              for (let y = 0; y < unique.times.length; y++) {
                newTimestamps.push(
                  createTimestamp(unique.dates[x], unique.times[y]),
                );
              }
            }
            onChange(newTimestamps);
          }}
        />
        <label htmlFor="date-sync">Use same time(s) for all dates</label>
      </div>
      {dateSync ? (
        <SyncedTimeList
          timestamps={timestamps}
          duration={duration}
          onChange={onChange}
        />
      ) : (
        <GroupedTimeList
          timestamps={timestamps}
          duration={duration}
          onChange={onChange}
        />
      )}
    </div>
  );
};

interface DateOrTimeSelectorProps {
  timestamps?: string[];
  onChange: (timestamps: string[]) => void;
  defaultDate?: Date;
  duration: number;
}

export const DateOrTimeSelector: React.VoidFunctionComponent<DateOrTimeSelectorProps> =
  ({ timestamps = [], onChange, defaultDate, duration }) => {
    // sort value
    const sortedValue = timestamps.sort();
    // get list of unique dates from the list of times
    const timesByDate = groupBy(sortedValue, (time) => time.substring(0, 10));
    return (
      <div className="rounded-md border md:flex">
        <div className="p-4 md:w-[440px]">
          <MultiDateSelect
            date={defaultDate}
            selected={Object.keys(timesByDate)}
            onAddToSelection={(date) => {
              onChange([...timestamps, date]);
            }}
            onRemoveFromSelection={(date) => {
              onChange(
                timestamps.filter((time) => {
                  return !time.includes(date);
                }),
              );
            }}
          />
        </div>
        <div className="grow p-4">
          {duration === 0 ? (
            <DateList dates={sortedValue} onChange={onChange} />
          ) : (
            <TimeList
              timestamps={sortedValue}
              onChange={onChange}
              duration={duration}
            />
          )}
        </div>
      </div>
    );
  };
