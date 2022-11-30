import clsx from "clsx";
import dayjs from "dayjs";
import React from "react";

export const StartTimeInput = React.forwardRef<
  HTMLInputElement,
  {
    value?: string;
    defaultValue?: string;
    duration: number;
    error?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.ChangeEventHandler<HTMLInputElement>;
  }
>(function StartTimeInput({ value, error, duration, ...props }, ref) {
  const endTime = React.useMemo(() => {
    if (!value) {
      return;
    }
    const start = dayjs(value, "HH:mm");
    if (!start.isValid()) {
      return;
    }

    const end = start.add(duration, "minutes");
    return end.format("HH:mm");
  }, [duration, value]);

  return (
    <div className="flex h-9 items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="text-gray-400">Start:</div>
        <input
          value={value}
          className={clsx(
            "rounded border-0 p-0 text-lg focus:ring-2 focus:ring-primary-500",
            {
              "border-rose-500": error,
            },
          )}
          type="time"
          {...props}
          ref={ref}
        />
      </div>
      {endTime ? (
        <div className="text-gray-400">
          <span>{`End: ${endTime}`}</span>
        </div>
      ) : null}
    </div>
  );
});
