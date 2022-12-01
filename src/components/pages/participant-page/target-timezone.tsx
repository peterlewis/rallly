import dayjs from "dayjs";
import React from "react";
import { createStateContext } from "react-use";

import { getBrowserTimeZone } from "../../../utils/date-time-utils";
import { usePoll } from "./poll-context";

export const [useTargetTimezone, TargetTimezoneProvider] = createStateContext(
  getBrowserTimeZone(),
);

export const TargetTimezone = () => {
  const poll = usePoll();
  const [targetTimezone] = useTargetTimezone();
  return (
    <div className="p-3 text-center text-slate-400">
      {poll.timeZone ? (
        <div>
          All times are <strong>{targetTimezone}</strong> time
        </div>
      ) : (
        <div>
          All times are <strong>Fixed</strong>
        </div>
      )}
    </div>
  );
};

export const useLocalTime = () => {
  const [targetTimezone, setTargetTimezone] = useTargetTimezone();
  const { timeZone } = usePoll();

  const convertToTargetTimezone = React.useCallback(
    (time: string) => {
      if (timeZone) {
        return dayjs(time)
          .tz(timeZone)
          .tz(targetTimezone)
          .format("YYYY-MM-DDTHH:mm:ss");
      }
      return time;
    },
    [targetTimezone, timeZone],
  );

  return {
    origintalTimezone: timeZone,
    targetTimezone,
    setTargetTimezone,
    convertToTargetTimezone,
  };
};
