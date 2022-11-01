import clsx from "clsx";

import Clock from "@/components/icons/clock.svg";

import { getDuration } from "../../utils/date-time-utils";
import { useDayjs } from "../../utils/dayjs";
import { GroupedList } from "../grouped-list";
import { DateOption, TimeOption } from "./types";

const GroupMonthYear: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);

  return (
    <div className="sticky top-0 z-30 p-6 text-xl">
      <div className="">
        {date.format("MMMM ")}
        <span className=" font-bold">{date.format("YYYY")}</span>
      </div>
    </div>
  );
};

const GroupDay: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);

  return (
    <div className="sticky top-0 z-20 m-2 p-3 text-left">
      <div className="flex items-center">
        <div className="mr-2 border-r pr-2 text-6xl font-medium leading-none">
          {date.format("D")}
        </div>
        <div>
          <div className="text-sm uppercase">{date.format("ddd")}</div>
          <div className="text-xs font-light uppercase">
            {date.format("MMMM")}
          </div>
          <div className="text-xs">{date.format("YYYY")}</div>
        </div>
      </div>
    </div>
  );
};

const GroupMonth: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);

  return (
    <div className="sticky top-0 z-10 border-b bg-gray-100 p-3 shadow-sm">
      {date.format("MMMM ")}
      <span className="font-bold">{date.format("YYYY")}</span>
    </div>
  );
};

export const TimeListVerticalItem = <T extends TimeOption>({
  item,
}: {
  item: T;
}) => {
  const { dayjs } = useDayjs();
  const start = dayjs(item.start);
  const end = dayjs(item.end);
  return (
    <div className="p-3 text-center">
      <div className="font-semibold">{start.format("LT")}</div>
      <div className="mx-auto -my-px h-2 w-px bg-slate-400/50 leading-none" />
      <div className="text-slate-400">{end.format("LT")}</div>
      <div className="mt-2 inline-flex items-center rounded bg-slate-400/10 px-1 text-sm leading-6 text-slate-400">
        <Clock className="mr-1 h-4" />
        {getDuration(item.start, item.end)}
      </div>
    </div>
  );
};

export const DateListVerticalItem = <T extends DateOption>({
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

// Defines the group def for all vertical time lists
export const TimeOptionListVertical = <T extends TimeOption>({
  data,
  itemRender = TimeListVerticalItem,
  className,
}: {
  className?: string;
  data: T[];
  itemRender: React.ComponentType<{ item: T }>;
}) => {
  return (
    <GroupedList
      className={clsx("relative", className)}
      data={data}
      itemsClassName="grow divide-y"
      groupsClassName="grow divide-y"
      groupDefs={[
        {
          groupBy: (option) => option.start.substring(0, 10),
          className: "flex grow items-start w-full",
          render: GroupDay,
        },
      ]}
      itemRender={itemRender}
    />
  );
};

// Defines the group def for all vertical date lists
export const DateOptionListVertical = <T extends DateOption>({
  data,
  itemRender = DateListVerticalItem,
  className,
}: {
  className?: string;
  data: T[];
  itemRender?: React.ComponentType<{ item: T }>;
}) => {
  return (
    <GroupedList
      className={clsx("", className)}
      data={data}
      itemsClassName="divide-y"
      groupsClassName="divide-y"
      groupDefs={[
        {
          groupBy: (option) => option.date.substring(0, 7),
          render: GroupMonth,
        },
      ]}
      itemRender={itemRender}
    />
  );
};
