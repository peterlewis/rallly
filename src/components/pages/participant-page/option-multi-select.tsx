import { VoteType } from "@prisma/client";
import clsx from "clsx";
import produce from "immer";
import React from "react";

import { useDayjs } from "../../../utils/dayjs";
import { GroupDefinition, GroupedList } from "../../grouped-list";
import { useVoteState, VoteSelector } from "../../poll/vote-selector";

type Option = {
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
        "flex h-12 select-none items-center gap-3 rounded border bg-white px-3 text-slate-700/90 shadow active:translate-y-px active:shadow-sm",
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
    <div className="sticky top-0 z-20 flex h-12 items-center border-b bg-white/90 px-4 font-semibold text-slate-700/75">
      {dayjs(value).format("MMMM YYYY")}
    </div>
  );
};

const DateMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <div className="sticky top-12 z-10 flex h-12 items-center border-b bg-white/90 px-4 font-semibold text-slate-700/75 shadow-sm">
      <div className="flex w-fit items-baseline gap-1">
        <div className="text-lg font-semibold">{dayjs(value).format("D")}</div>
        <div className="text-slate-700/75">{dayjs(value).format("dddd")}</div>
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
            itemsClassName: "p-3 space-y-3",
            render: DateMarker,
          },
        ]
      : [
          {
            groupBy: (a) => a.start.substring(0, 7),
            itemsClassName: "space-y-3 p-3",
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
