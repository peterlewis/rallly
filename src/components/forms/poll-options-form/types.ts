export type DateOption = {
  type: "date";
  date: string;
};

export type TimeOption = {
  type: "time";
  start: string;
  end: string;
};

export type DateTimeOption = DateOption | TimeOption;

export type DurationValue = number | "allDay";

export interface DateTimePickerProps {
  title?: string;
  options: DateTimeOption[];
  date: Date;
  onNavigate?: (date: Date) => void;
  onChange?: (options: DateTimeOption[]) => void;
  duration?: DurationValue;
  scrollToTime?: Date;
}
