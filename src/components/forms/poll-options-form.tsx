import { useTranslation } from "next-i18next";
import * as React from "react";
import { useForm } from "react-hook-form";

import Calendar from "@/components/icons/calendar.svg";
import Clock from "@/components/icons/clock.svg";
import Table from "@/components/icons/table.svg";
import X from "@/components/icons/x.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { DateOption } from "../../utils/trpc/types";
import { useWideScreen } from "../../utils/use-wide-screen";
import { useModal } from "../modal";
import { RadioGroup } from "../radio";
import MonthCalendar from "./poll-options-form/month-calendar";
import { TimezonePicker } from "./poll-options-form/time-zone-policy";
import { DateTimeOption } from "./poll-options-form/types";
import WeekCalendar from "./poll-options-form/week-calendar";
import { PollFormProps } from "./types";

export type PollOptionsData = {
  navigationDate: string; // used to navigate to the right part of the calendar
  duration: number; // duration of the event in minutes
  timeZone: string;
  view: string;
  options: DateTimeOption[];
};

const PollOptionsForm: React.VoidFunctionComponent<
  PollFormProps<PollOptionsData> & { title?: string }
> = ({ formId, defaultValues, onSubmit, onChange, title }) => {
  const { t } = useTranslation("app");
  const isWideScreen = useWideScreen();
  const { handleSubmit, watch, setValue, formState } = useForm<PollOptionsData>(
    {
      defaultValues,
      resolver: (values) => {
        return {
          values,
          errors:
            values.options.length === 0
              ? {
                  options: true,
                }
              : {},
        };
      },
    },
  );

  const views = React.useMemo(() => {
    const res = [
      {
        label: t("monthView"),
        value: "month",
        Component: MonthCalendar,
      },
    ];

    if (isWideScreen) {
      res.push({
        label: t("weekView"),
        value: "week",
        Component: WeekCalendar,
      });
    }

    return res;
  }, [isWideScreen, t]);

  const watchView = watch("view");

  const selectedView = React.useMemo(
    () => views.find((view) => view.value === watchView) ?? views[0],
    [views, watchView],
  );

  const watchOptions = watch("options");
  const watchDuration = watch("duration");
  const watchTimeZone = watch("timeZone");

  const [dateOrTimeRangeModal, openDateOrTimeRangeModal] = useModal({
    title: t("mixedOptionsTitle"),
    description: t("mixedOptionsDescription"),
    okText: t("mixedOptionsKeepTimes"),
    onOk: () => {
      setValue(
        "options",
        watchOptions.filter((option) => option.type === "time"),
      );
      if (!watchTimeZone) {
        setValue("timeZone", getBrowserTimeZone());
      }
    },
    cancelText: t("mixedOptionsKeepDates"),
    onCancel: () => {
      setValue(
        "options",
        watchOptions.filter((option) => option.type === "date"),
      );
      setValue("timeZone", "");
    },
  });

  React.useEffect(() => {
    if (onChange) {
      const subscription = watch(({ options = [], ...rest }) => {
        // Watch returns a deep partial here which is not really accurate and messes up
        // the types a bit. Repackaging it to keep the types sane.
        onChange({ options: options as DateOption[], ...rest });
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [watch, onChange]);

  React.useEffect(() => {
    if (watchOptions.length > 1) {
      const optionType = watchOptions[0].type;
      // all options needs to be the same type
      if (watchOptions.some((option) => option.type !== optionType)) {
        openDateOrTimeRangeModal();
      }
    }
  }, [watchOptions, openDateOrTimeRangeModal]);

  const watchNavigationDate = watch("navigationDate");
  const navigationDate = new Date(watchNavigationDate);

  const [calendarHelpModal, openHelpModal] = useModal({
    overlayClosable: true,
    title: t("calendarHelpTitle"),
    description: t("calendarHelp"),
    okText: t("ok"),
  });

  const isAllDayEvent =
    watchOptions.length > 0 && watchOptions[0].type === "date";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit, openHelpModal)}>
      {calendarHelpModal}
      {dateOrTimeRangeModal}
      <div className="overflow-hidden bg-white sm:rounded-md sm:border">
        <div className="hidden justify-center p-3 sm:flex">
          <RadioGroup
            className="w-full sm:w-auto"
            value={selectedView.value}
            onChange={(value) => setValue("view", value)}
            options={[
              {
                label: (
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" /> {t("monthView")}
                  </span>
                ),
                value: "month",
              },
              {
                label: (
                  <span className="flex items-center">
                    <Table className="mr-2 h-5 w-5" /> {t("weekView")}
                  </span>
                ),
                value: "week",
              },
            ]}
          />
        </div>
        <div className="sm:min-h-[400px] lg:h-[calc(100vh-100px)] lg:max-h-[640px]">
          <selectedView.Component
            title={title}
            options={watchOptions}
            date={navigationDate}
            onNavigate={(date) => {
              setValue("navigationDate", date.toISOString());
            }}
            onChange={(options) => {
              setValue("options", options);
              if (
                options.length === 0 ||
                options.every((option) => option.type === "date")
              ) {
                // unset the timeZone if we only have date option
                setValue("timeZone", "");
              }
              if (
                options.length > 0 &&
                !formState.touchedFields.timeZone &&
                options.every((option) => option.type === "time")
              ) {
                // set timeZone if we are adding time ranges and we haven't touched the timeZone field
                setValue("timeZone", getBrowserTimeZone());
              }
            }}
            duration={watchDuration}
            onChangeDuration={(duration) => {
              setValue("duration", duration);
            }}
          />
        </div>
        <div className="shrink-0 space-y-4 border-y py-3 px-3 sm:flex sm:h-14 sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 sm:border-b-0">
          <TimezonePicker
            className="w-full sm:w-auto"
            value={watchTimeZone ? "auto" : "fixed"}
            disabled={isAllDayEvent}
            onChange={(timezone) => {
              setValue(
                "timeZone",
                timezone === "auto" ? getBrowserTimeZone() : "",
              );
            }}
          />
          {watchOptions.length > 0 ? (
            <div className="inline-flex h-8 items-center space-x-2 overflow-hidden rounded-md bg-primary-600/10 pl-2 text-sm text-primary-600">
              <Clock className="h-5" />
              <div>
                {t("optionsCount", {
                  count: watchOptions.length,
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("options", []);
                }}
                className="h-full border-l border-primary-600/10 px-2 text-primary-500 hover:bg-primary-500/5 active:bg-primary-500/10"
              >
                <X className="h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default PollOptionsForm;
