import * as React from "react";

import Clock from "@/components/icons/clock.svg";

import { getDuration } from "../../../utils/date-time-utils";
import { useDayjs } from "../../../utils/dayjs";
import PollOption, { PollOptionProps } from "./poll-option";

export interface TimeSlotOptionProps extends PollOptionProps {
  startTime: string;
  endTime: string;
}

const TimeSlotOption: React.VoidFunctionComponent<TimeSlotOptionProps> = ({
  startTime,
  endTime,
  ...rest
}) => {
  const { dayjs } = useDayjs();
  return (
    <PollOption {...rest}>
      <div className="grow">
        <div className="h-7">{`${dayjs(startTime).format("LT")} - ${dayjs(
          endTime,
        ).format("LT")}`}</div>
        <div className="flex grow items-center text-sm text-slate-400">
          <Clock className="leading- mr-1 inline w-4" />
          {getDuration(startTime, endTime)}
        </div>
      </div>
    </PollOption>
  );
};

export default TimeSlotOption;
