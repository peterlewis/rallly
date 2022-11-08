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
import { DateTimeOption, DateTimePickerProps } from "../types";
import { isoDateTimeFormat } from "../utils";
import { MultiDateSelect } from "./multi-date-select";
import { TimeSlotPicker } from "./time-slot-picker";

const MonthCalendar: React.VoidFunctionComponent<DateTimePickerProps> = ({
  options = [],
  onNavigate,
  date = new Date(),
  onChange,
  duration = 60,
  onChangeDuration,
}) => {
  const { t } = useTranslation("app");
  const [isAllDay, setIsAllDay] = React.useState(() => {
    return !options.some((option) => option.type === "time");
  });

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

  return (
    <div className="h-full rounded-md border md:flex">
      <div className="border-b p-4 md:w-[440px] md:border-r md:border-b-0">
        <MultiDateSelect
          selected={Object.keys(optionsByDay)}
          weekStartsOn={weekStartsOn}
          onAddToSelection={(newDateString) => {
            let newOption: DateTimeOption;
            if (!isAllDay) {
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
      <div className="flex grow flex-col">
        <div className="border-b shadow-sm">
          <div className="flex items-center space-x-3 p-4">
            <div className="grow">
              <div className="font-medium">{t("specifyTimes")}</div>
              <div className="text-sm text-gray-400">
                {t("specifyTimesDescription")}
              </div>
            </div>
            <div>
              <Switch
                data-testid="specify-times-switch"
                checked={!isAllDay}
                onChange={(checked) => {
                  setIsAllDay(!checked);
                  if (checked) {
                    // convert dates to time slots
                    onChange?.(
                      options.map((option) => {
                        if (option.type === "time") {
                          throw new Error(
                            "Expected option to be a date but received timeSlot",
                          );
                        }

                        const start = `${option.date}T08:00:00`;

                        return {
                          type: "time",
                          start,
                          end: dayjs(start)
                            .add(duration, "minutes")
                            .format("YYYY-MM-DDTHH:mm:ss"),
                        };
                      }),
                    );
                  } else {
                    onChange?.(
                      datepicker.selection.map((date) => ({
                        type: "date",
                        date,
                      })),
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
        {options.length === 0 ? (
          <EmptyState icon={Calendar} text={t("noDatesSelected")} />
        ) : null}
        <div className="grow divide-y overflow-y-scroll px-4">
          {Object.keys(optionsByDay)
            .sort((a, b) => (a > b ? 1 : -1))
            .map((dateString) => {
              const optionsForDay = optionsByDay[dateString];
              const date = dayjs(dateString);
              const lastOption = optionsForDay[optionsForDay.length - 1].option;

              return (
                <div key={dateString} className="flex space-x-4 py-4">
                  <div>
                    <div className="text-2xl font-bold">{date.format("D")}</div>
                    <div className="text-sm uppercase text-gray-400">
                      {date.format("MMM")}
                    </div>
                  </div>
                  <div className="grow">
                    {optionsForDay.map(({ option, index }) => {
                      if (option.type === "date") {
                        return (
                          <div key={option.date} className="flex space-x-4">
                            <div className="grow rounded-lg border border-dashed p-4 text-center text-sm text-gray-400">
                              {t("allDay")}
                            </div>
                            <div>
                              <CompactButton
                                icon={X}
                                onClick={() => {
                                  onChange?.(
                                    produce(options, (draft) => {
                                      draft.splice(index, 1);
                                    }),
                                  );
                                }}
                              />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={`${index}-${option.start}-${option.end}`}>
                          <div className="mb-3 flex space-x-4">
                            <div className="flex grow items-center space-x-4">
                              <TimeSlotPicker
                                value={[option.start, option.end]}
                                onChange={([newStartTime, newEndtime]) => {
                                  onChange?.(
                                    produce(options, (draft) => {
                                      draft[index] = {
                                        type: "time",
                                        start: newStartTime,
                                        end: newEndtime,
                                      };
                                    }),
                                  );

                                  const newDuration = dayjs(newEndtime).diff(
                                    newStartTime,
                                    "minutes",
                                  );

                                  if (newDuration !== duration) {
                                    onChangeDuration?.(newDuration);
                                  }
                                }}
                                suffix={
                                  <CompactButton
                                    icon={X}
                                    onClick={() => {
                                      onChange?.(
                                        produce(options, (draft) => {
                                          draft.splice(index, 1);
                                        }),
                                      );
                                    }}
                                  />
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {lastOption.type === "time" ? (
                      <div className="flex items-center space-x-4">
                        <Button
                          icon={<PlusSm />}
                          onClick={() => {
                            const end = dayjs(lastOption.end);

                            let newEnd = end.add(duration, "minutes");

                            if (!newEnd.isSame(end, "day")) {
                              newEnd = end.set("hour", 23).set("minute", 59);
                            }
                            onChange?.(
                              produce(options, (draft) => {
                                draft.push({
                                  type: "time",
                                  start: end.format("YYYY-MM-DDTHH:mm:ss"),
                                  end: newEnd.format("YYYY-MM-DDTHH:mm:ss"),
                                });
                              }),
                            );
                          }}
                        >
                          {t("addTimeOption")}
                        </Button>
                        <Dropdown
                          trigger={<CompactButton icon={DotsHorizontal} />}
                          placement="bottom-start"
                        >
                          <DropdownItem
                            icon={Magic}
                            disabled={datepicker.selection.length < 2}
                            label={t("applyToAllDates")}
                            onClick={() => {
                              const times = optionsForDay.map(({ option }) => {
                                if (option.type === "date") {
                                  throw new Error(
                                    "Expected timeSlot but got date",
                                  );
                                }

                                return {
                                  startTime: option.start.substring(
                                    option.start.indexOf("T"),
                                  ),
                                  endTime: option.end.substring(
                                    option.end.indexOf("T"),
                                  ),
                                };
                              });
                              const newOptions: DateTimeOption[] = [];
                              Object.keys(optionsByDay).forEach(
                                (dateString) => {
                                  times.forEach((time) => {
                                    newOptions.push({
                                      type: "time",
                                      start: dateString + time.startTime,
                                      end: dateString + time.endTime,
                                    });
                                  });
                                },
                              );
                              onChange?.(newOptions);
                            }}
                          />
                          <DropdownItem
                            label={t("deleteDate")}
                            icon={Trash}
                            onClick={() => {
                              removeAllOptionsForDay(dateString);
                            }}
                          />
                        </Dropdown>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
