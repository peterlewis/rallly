import dayjs from "dayjs";
import React from "react";

interface DayProps {
  date: string;
  day: string;
  weekend: boolean;
  outOfMonth: boolean;
  today: boolean;
  selected: boolean;
}

export interface HeadlessDatePickerOptions {
  onChangeSelected?: (selection: string[]) => void;
  date?: Date;
  selected?: string[];
  onNavigationChange?: (date: Date) => void;
  onAddToSelection?: (date: string) => void;
  onRemoveFromSelection?: (date: string) => void;
  weekStartsOn?: "monday" | "sunday";
}

const today = new Date();

export const useHeadlessDatePicker = (
  options?: HeadlessDatePickerOptions,
): {
  label: string;
  next: () => void;
  prev: () => void;
  today: () => void;
  daysOfWeek: string[];
  days: DayProps[];
  navigationDate: Date;
  selection: string[];
  toggle: (date: string) => string[];
} => {
  const [localSelection, setSelection] = React.useState<string[]>([]);
  const selection = options?.selected ?? localSelection;
  const [localNavigationDate, setNavigationDate] = React.useState(today);
  const navigationDate = dayjs(options?.date ?? localNavigationDate);

  const firstDayOfMonth = navigationDate.startOf("month");
  const firstDayOfFirstWeek = firstDayOfMonth.startOf("week");

  const currentMonth = navigationDate.get("month");

  const days: DayProps[] = [];

  const daysOfWeek: string[] = [];

  for (let i = 0; i < 7; i++) {
    daysOfWeek.push(firstDayOfFirstWeek.add(i, "days").format("dd"));
  }

  let reachedEnd = false;
  let i = 0;
  do {
    const d = firstDayOfFirstWeek.add(i, "days");
    days.push({
      date: d.format("YYYY-MM-DD"),
      day: d.format("D"),
      weekend: d.day() === 0 || d.day() === 6,
      outOfMonth: d.month() !== currentMonth,
      today: d.isSame(today, "day"),
      selected: selection.some((selectedDate) => d.isSame(selectedDate, "day")),
    });
    i++;
    reachedEnd =
      i > 34 && i % 7 === 0 && d.add(1, "day").month() !== currentMonth;
  } while (reachedEnd === false);

  return {
    navigationDate: navigationDate.toDate(),
    label: navigationDate.format("MMMM YYYY"),
    next: () => {
      const newDate = navigationDate.add(1, "month").startOf("month").toDate();
      if (!options?.date) {
        setNavigationDate(newDate);
      }
      options?.onNavigationChange?.(newDate);
    },
    prev: () => {
      const newDate = navigationDate.add(-1, "month").startOf("month").toDate();
      if (!options?.date) {
        setNavigationDate(newDate);
      }
      options?.onNavigationChange?.(newDate);
    },
    today: () => {
      const newDate = today;
      if (!options?.date) {
        setNavigationDate(newDate);
      }
      options?.onNavigationChange?.(newDate);
    },
    days,
    daysOfWeek,
    selection: options?.selected ?? selection,
    toggle: (date) => {
      const index = selection.indexOf(date);

      const isNotAlreadySelected = index === -1;
      const newSelection = isNotAlreadySelected
        ? [...selection, date]
        : [...selection].splice(index, 1);

      if (isNotAlreadySelected) {
        options?.onAddToSelection?.(date);
      } else {
        options?.onRemoveFromSelection?.(date);
      }

      if (!options?.selected) {
        // ignore, selection is controlled externally\
        setSelection(newSelection);
      }

      return newSelection;
    },
  };
};
