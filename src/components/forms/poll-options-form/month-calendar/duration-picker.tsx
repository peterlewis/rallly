import dayjs from "dayjs";
import React, { ChangeEventHandler } from "react";

import { TextInput } from "../../../text-input";

type DurationValue = number;

export const DurationPicker = ({
  duration,
  onChange,
}: {
  duration: DurationValue;
  onChange: (duration: DurationValue) => void;
}) => {
  const [isCustom, setCustom] = React.useState(false);

  const handleChange = (value: string) => {
    return onChange(parseInt(value));
  };

  return (
    <div className="action-group">
      <select
        value={isCustom ? "custom" : duration}
        onChange={(e) => {
          if (e.target.value === "custom") {
            setCustom(true);
            onChange(120);
          } else {
            setCustom(false);
            handleChange(e.target.value);
          }
        }}
        className="input pr-8"
      >
        <option value="custom">Custom</option>
        <option value="0">All-day</option>
        {[...Array(3)].map((_, i) => {
          const minutes = (i + 1) * 15;
          return (
            <option key={i} value={minutes}>
              {dayjs.duration(minutes, "minutes").humanize()}
            </option>
          );
        })}
        {[...Array(8)].map((_, i) => {
          const hours = i + 1;
          return (
            <option key={i} value={hours * 60}>
              {dayjs.duration(hours, "hours").humanize()}
            </option>
          );
        })}
      </select>
      {isCustom ? (
        <input
          className="input w-20"
          type="number"
          value={duration}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : null}
    </div>
  );
};
