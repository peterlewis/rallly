import React from "react";

import MonthCalendar from "./forms/poll-options-form/month-calendar";
import { DateTimeOption } from "./forms/poll-options-form/types";

export const DateOrTimeSelector: React.VoidFunctionComponent<{
  value?: DateTimeOption[];
  onChange?: (value: DateTimeOption[]) => void;
  date?: Date;
}> = ({ value = [], onChange, date = new Date() }) => {
  const [navigationDate, setNavigationDare] = React.useState(date);

  return (
    <MonthCalendar
      options={value}
      onChange={onChange}
      date={navigationDate}
      onNavigate={setNavigationDare}
    />
  );
};
