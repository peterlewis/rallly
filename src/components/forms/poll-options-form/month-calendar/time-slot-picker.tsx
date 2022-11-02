import clsx from "clsx";
import dayjs from "dayjs";
import React from "react";

export const TimeSlotPicker: React.VoidFunctionComponent<{
  value: [string, string];
  onChange: (value: [string, string]) => void;
  suffix?: React.ReactNode;
}> = ({ value, onChange, suffix }) => {
  const [hasFocus, setFocus] = React.useState(false);
  const [startTime, endTime] = value;
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  const startTimeInput = React.useRef<HTMLInputElement>(null);
  const endTimeInput = React.useRef<HTMLInputElement>(null);

  const duration = end.diff(start, "minutes");

  React.useEffect(() => {
    const [newStart, newEnd] = value;
    if (startTimeInput.current && endTimeInput.current) {
      startTimeInput.current.value = dayjs(newStart).format("HH:mm");
      endTimeInput.current.value = dayjs(newEnd).format("HH:mm");
    }
  }, [value]);
  return (
    <div
      className={clsx("input flex items-center space-x-4 bg-white py-0 px-4", {
        "border-primary-600 ring-1 ring-primary-600": hasFocus,
      })}
    >
      <input
        ref={startTimeInput}
        type="time"
        className="cursor-pointer border-0 p-0 focus:ring-0 dark:bg-gray-700"
        step={60 * 5}
        onFocus={() => {
          setFocus(true);
        }}
        defaultValue={start.format("HH:mm")}
        onBlur={(e) => {
          setFocus(false);
          const [hour, minute] = e.target.value.split(":");
          const newStart = start
            .set("hour", parseInt(hour))
            .set("minute", parseInt(minute));

          onChange([
            newStart.format("YYYY-MM-DDTHH:mm:ss"),
            newStart.add(duration, "minutes").format("YYYY-MM-DDTHH:mm:ss"),
          ]);
        }}
      />
      <div className="text-gray-400">&rarr;</div>
      <input
        ref={endTimeInput}
        type="time"
        onFocus={() => setFocus(true)}
        className="h-9 cursor-pointer border-0 p-0 focus:ring-0 dark:bg-gray-700"
        step={60 * 5}
        min={start.format("HH:mm")}
        onBlur={(e) => {
          const [hour, minute] = e.target.value.split(":");
          setFocus(false);
          const newEnd = end
            .set("hour", parseInt(hour))
            .set("minute", parseInt(minute));

          if (newEnd.isAfter(start)) {
            onChange([startTime, newEnd.format("YYYY-MM-DDTHH:mm:ss")]);
          } else {
            e.target.value = end.format("HH:mm");
          }
        }}
        defaultValue={end.format("HH:mm")}
      />
      {suffix}
    </div>
  );
};
