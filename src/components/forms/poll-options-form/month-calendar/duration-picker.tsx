import dayjs from "dayjs";

type DurationValue = number;

export const DurationPicker = ({
  duration,
  onChange,
}: {
  duration: DurationValue;
  onChange: (duration: DurationValue) => void;
}) => {
  return (
    <select
      value={duration}
      onChange={(e) => {
        onChange(parseInt(e.target.value));
      }}
      className="input pr-8"
    >
      <option>Custom</option>
      {[...Array(3)].map((_, i) => {
        const minutes = (i + 1) * 15;
        return (
          <option key={i} value={minutes * 15}>
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
      <option value="0">All-day</option>
    </select>
  );
};
