import dayjs from "dayjs";
import React from "react";

const parseTime = (time: string): [number, number] => {
  const [hour, minute] = time.split(":");
  return [parseInt(hour), parseInt(minute)];
};

export const StartTimeInput: React.VoidFunctionComponent<{
  value?: string;
  duration: number;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}> = ({ value, duration, autoFocus, onChange }) => {
  const endTime = React.useMemo(() => {
    if (!value) {
      return;
    }
    const [hour, minute] = parseTime(value);
    const start = dayjs().set("hour", hour).set("minute", minute);
    const end = start.add(duration, "minutes");
    return end.format("HH:mm");
  }, [duration, value]);

  return (
    <div className="flex h-9 items-center gap-2">
      <div className="flex items-center">
        <span className="mr-2 text-gray-400">From:</span>
        <input
          autoFocus={autoFocus}
          defaultValue={value}
          className="rounded border-0 p-0 focus:ring-2 focus:ring-primary-500"
          type="time"
          onBlur={(e) => {
            onChange(e.target.value);
          }}
        />
      </div>
      {endTime ? <span className="text-gray-400">Till: {endTime}</span> : null}
    </div>
  );
};
