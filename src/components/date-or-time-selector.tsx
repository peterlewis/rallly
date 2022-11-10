import dayjs from "dayjs";
import React from "react";

import MonthCalendar from "./forms/poll-options-form/month-calendar";
import {
  DateOption,
  DateTimeOption,
  TimeOption,
} from "./forms/poll-options-form/types";

interface DateOrTimeSelectorProps {
  value?: DateTimeOption[];
  onChange?: (value: DateTimeOption[]) => void;
  defaultDate?: Date;
}

type DateOrTimeInput =
  | {
      isAllDay: true;
      value: DateOption[];
    }
  | {
      isAllDay: false;
      value: TimeOption[];
    };

const DateOrTimeSelectorInner: React.VoidFunctionComponent<
  DateOrTimeSelectorProps & DateOrTimeInput
> = (props) => {
  const { value = [], onChange, defaultDate = new Date() } = props;
  const [navigationDate, setNavigationDare] = React.useState(defaultDate);

  return (
    <MonthCalendar
      options={value}
      onChange={onChange}
      date={navigationDate}
      onNavigate={setNavigationDare}
    />
  );
};

export const DateOrTimeSelector: React.VoidFunctionComponent<DateOrTimeSelectorProps> =
  (props) => {
    const input = React.useMemo<DateOrTimeInput>(() => {
      return {
        isAllDay:
          !props.value ||
          props.value.length === 0 ||
          props.value[0].type === "date",
        value: props.value as any, // we assume values are of the same type
      };
    }, [props.value]);
    return <DateOrTimeSelectorInner {...props} {...input} />;
  };
