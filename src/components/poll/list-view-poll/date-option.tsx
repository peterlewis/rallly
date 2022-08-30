import * as React from "react";

import { useDayjs } from "../../../utils/dayjs";
import PollOption, { PollOptionProps } from "./poll-option";

export interface DateOptionProps extends PollOptionProps {
  date: string;
}

const DateOption: React.VoidFunctionComponent<DateOptionProps> = ({
  date,
  ...rest
}) => {
  const { dayjs } = useDayjs();
  const d = dayjs(date);
  return (
    <PollOption {...rest}>
      <div className="font-semibold leading-9">
        <span className="text-2xl">{d.format("D")}</span>
        &nbsp;
        <span className="text-sm uppercase text-slate-400">
          {d.format("ddd")}
        </span>
      </div>
    </PollOption>
  );
};

export default DateOption;
