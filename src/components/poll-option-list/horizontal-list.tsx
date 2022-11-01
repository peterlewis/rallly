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
    <div className="sticky left-4 z-10 mb-4 w-fit rounded rounded-t-md border bg-white/90 p-2 text-center text-lg leading-none shadow-sm">
      <div className="">{date.format("MMMM YYYY")}</div>
    </div>
  );
};

const GroupHeaderDay: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);
  return (
    <div className="sticky left-4 z-10 mb-4 w-fit rounded rounded-t-md border bg-white/90 p-2 text-center text-lg leading-none shadow-sm">
      <div className="font-bold">{date.format("D dddd")}</div>
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
    <div className="p-4 text-center">
      <div className="origin-center -rotate-12 whitespace-nowrap">
        {start.format("LT")}
      </div>
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
      <div className="py-2 px-4 text-sm">
        <div className="uppercase">{date.format("ddd")}</div>
        <div className="text-2xl font-bold text-slate-700">
          {date.format("DD ")}
        </div>
      </div>
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
      className={clsx("p-4", className)}
      data={data}
      groupDefs={[
        {
          groupBy: (option) => option.start.substring(0, 7),
          itemsClassName: "flex gap-4",
          render: GroupHeaderMonthYear,
        },
        {
          groupBy: (option) => option.start.substring(0, 10),
          itemsClassName: "flex bg-white rounded shadow-sm",
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
      itemsClassName="flex mx-2  relative px-1 bg-white rounded border shadow-sm"
      groupsClassName="flex z-10"
      groupDefs={[
        {
          groupBy: (option) => option.date.substring(0, 7),
          className: "flex items-start",
          render: GroupHeaderMonthYear,
        },
      ]}
      itemRender={itemRender}
    />
  );
};
