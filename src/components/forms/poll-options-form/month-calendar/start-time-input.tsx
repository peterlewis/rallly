import dayjs from "dayjs";

export const StartTimeInput: React.VoidFunctionComponent<{
  value: string;
  duration: number;
  onChange: (value: string) => void;
}> = ({ value, duration, onChange }) => {
  const start = value.substring(11, 16);
  const endTime = dayjs(value).add(duration, "minutes").format("HH:mm");

  return (
    <div className="flex items-center gap-3">
      Start:
      <input
        value={start}
        className="input"
        type="time"
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <span className="text-sm text-gray-400">Till: {endTime}</span>
    </div>
  );
};
