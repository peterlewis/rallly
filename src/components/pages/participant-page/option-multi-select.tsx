import { VoteType } from "@prisma/client";
import clsx from "clsx";
import produce from "immer";
import React from "react";

import { useDayjs } from "../../../utils/dayjs";
import { GroupDefinition, GroupedList } from "../../grouped-list";
import { useVoteState, VoteSelector } from "../../poll/vote-selector";

export type Option = {
  id: string;
  start: string;
  duration: number;
  index: number;
  value?: VoteType;
};

const Row: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  value?: VoteType;
  onChange: (value: VoteType) => void;
}> = ({ children, value, onChange }) => {
  const { toggle } = useVoteState(value);
  return (
    <div
      role="button"
      onClick={() => {
        onChange(toggle());
      }}
      className={clsx(
        "flex h-12 select-none items-center gap-3 rounded border bg-white/50 px-3 font-semibold text-slate-700/90 hover:bg-white/75 active:bg-white/50 active:shadow-sm",
        {
          "border-green-400 ring-1 ring-green-400": value === "yes",
          "border-amber-300 ring-1 ring-amber-300": value === "ifNeedBe",
        },
      )}
    >
      <VoteSelector value={value} onChange={onChange} />
      {children}
    </div>
  );
};

const MonthMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <div className="sticky top-0 z-20 flex h-10 items-center border-b bg-gray-50/90 px-4 text-slate-500">
      {dayjs(value).format("MMMM YYYY")}
    </div>
  );
};

const DateMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <div className="sticky top-10 z-10 flex h-10 items-center border-b bg-gray-50/90 px-4 text-slate-500 shadow-sm">
      <div className="flex w-fit items-baseline gap-1">
        <div>{dayjs(value).format("D")}</div>
        <div>{dayjs(value).format("dddd")}</div>
      </div>
    </div>
  );
};

export const OptionMultiSelect: React.VoidFunctionComponent<{
  className?: string;
  options: Array<Option>;
  onChange?: (value: Array<Option>) => void;
}> = ({ options, onChange, className }) => {
  const { dayjs } = useDayjs();

  const groupDefinitions = React.useMemo<GroupDefinition<Option>[]>(() => {
    return options[0].duration > 0
      ? [
          {
            groupBy: (a) => a.start.substring(0, 7),
            itemsClassName: "divide-y",
            render: MonthMarker,
          },
          {
            groupBy: (a) => a.start.substring(0, 10),
            itemsClassName: "p-3 space-y-2",
            render: DateMarker,
          },
        ]
      : [
          {
            groupBy: (a) => a.start.substring(0, 7),
            itemsClassName: "space-y-2 p-3",
            render: MonthMarker,
          },
        ];
  }, [options]);

  return (
    <GroupedList
      data={options}
      className={clsx(className)}
      groupDefs={groupDefinitions}
      itemRender={({ item }) => (
        <Row
          value={item.value}
          onChange={(newValue) => {
            onChange?.(
              produce(options, (draft) => {
                draft[item.index].value = newValue;
              }),
            );
          }}
        >
          {item.duration === 0
            ? dayjs(item.start).format("D dddd")
            : `${dayjs(item.start).format("LT")} - ${dayjs(item.start)
                .add(item.duration, "minutes")
                .format("LT")}`}
        </Row>
      )}
    />
  );
};
