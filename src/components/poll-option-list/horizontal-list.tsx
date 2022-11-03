import clsx from "clsx";
import React from "react";

import Clock from "@/components/icons/clock.svg";

import { getDuration } from "../../utils/date-time-utils";
import { useDayjs } from "../../utils/dayjs";
import { GroupedList } from "../grouped-list";
import { DateOption, TimeOption } from "./types";

const GroupHeaderMonthYear: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();

  const date = dayjs(value);

  return (
    <div className="flex h-10 items-center bg-white">
      <div className="sticky left-48 z-10 w-fit p-3 text-center leading-none text-slate-600">
        <div className="font-semibold">
          <span>{date.format("MMMM ")}</span>
          <span className="">{date.format("YYYY")}</span>
        </div>
      </div>
    </div>
  );
};

const GroupHeaderDay: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);
  return (
    <div className="flex h-12 items-center bg-white">
      <div className="sticky left-48 z-10 w-24 px-3 leading-none">
        <span className="text-xl font-bold text-slate-600">
          {date.format("D")}
        </span>
        <span className="text-sm text-slate-500/90">{date.format(" ddd")}</span>
      </div>
    </div>
  );
};

export const TimeListHorizontalItem = <T extends TimeOption>({
  item,
}: {
  item: T;
}) => {
  const { dayjs } = useDayjs();
  const start = dayjs(item.start);
  const end = dayjs(item.end);
  return (
    <div className="text-center">
      <div className="whitespace-nowrap font-bold">{start.format("LT")}</div>
      <div className="whitespace-nowrap">{end.format("LT")}</div>
    </div>
  );
};

export const DateListHorizontalItem = <T extends DateOption>({
  item,
}: {
  item: T;
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(item.date);
  return (
    <div className="p-1 text-center">
      <span className="text-xl font-bold">{date.format("D")}</span>
      <span className="text-sm">{date.format(" ddd")}</span>
    </div>
  );
};

// Defines the group def for all horizontal time lists
export const TimeOptionListHorizontal = <T extends TimeOption>({
  data,
  itemRender,
  className,
}: {
  className?: string;
  data: T[];
  itemRender: React.ComponentType<{ item: T }>;
}) => {
  return (
    <GroupedList
      className={clsx("flex divide-x", className)}
      data={data}
      groupDefs={[
        {
          groupBy: (option) => option.start.substring(0, 7),
          itemsClassName: "flex divide-x border-slate-200 grow",
          className: "divide-y grow",
          render: GroupHeaderMonthYear,
        },
        {
          groupBy: (option) => option.start.substring(0, 10),
          itemsClassName: "flex divide-x border-slate-200 grow",
          className: "divide-y grow",
          render: GroupHeaderDay,
        },
      ]}
      itemRender={itemRender}
    />
  );
};

// Defines the group def for all horizontal date lists
export const DateOptionListHorizontal = <T extends DateOption>({
  data,
  itemRender = DateListHorizontalItem,
  className,
}: {
  className?: string;
  data: T[];
  itemRender?: React.ComponentType<{ item: T }>;
}) => {
  return (
    <GroupedList
      className={className}
      data={data}
      groupDefs={[
        {
          groupBy: (option) => option.date.substring(0, 7),
          itemsClassName: "divide-x flex border-slate-200",
          className: "divide-y",
          render: GroupHeaderMonthYear,
        },
      ]}
      itemRender={itemRender}
    />
  );
};
