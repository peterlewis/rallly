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
  const { toggle } = useVoteState();
  const paintValue = React.useContext(OptionMultiSelectContext);
  return (
    <div
      role="button"
      onMouseDown={() => {
        onChange(toggle(value));
      }}
      onMouseEnter={() => {
        if (paintValue) {
          onChange(paintValue);
        }
      }}
      className={clsx(
        "flex h-12 select-none items-center gap-3 rounded border bg-white px-3 font-semibold text-slate-700/90",
        {
          "border-amber-400 bg-amber-50 ring-1 ring-amber-400":
            value === "ifNeedBe",
          "border-green-400 bg-green-50 ring-1 ring-green-400": value === "yes",
          "border-slate-400 bg-slate-50 ring-1 ring-slate-400": value === "no",
        },
      )}
    >
      <VoteSelector value={value} className="pointer-events-none" />
      {children}
    </div>
  );
};

const Marker: React.VoidFunctionComponent<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="sticky top-0 z-20 -mb-px flex h-12 select-none items-center border-b bg-white/90 px-6 font-semibold text-slate-700/75">
      {children}
    </div>
  );
};

const MonthMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <Marker>
      <div>{dayjs(value).format("MMMM YYYY")}</div>
    </Marker>
  );
};

const DateMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <Marker>
      <div>{dayjs(value).format("LL")}</div>
      <div className="ml-2 font-normal text-slate-700/50">
        {dayjs(value).fromNow()}
      </div>
    </Marker>
  );
};

const OptionMultiSelectContext =
  React.createContext<VoteType | undefined>(undefined);

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

  const [paintValue, setPaintValue] = React.useState<VoteType>();

  React.useEffect(() => {
    const handler = () => {
      setPaintValue(undefined);
    };
    window.addEventListener("mouseup", handler);
    return () => {
      window.removeEventListener("mouseup", handler);
    };
  }, []);

  return (
    <OptionMultiSelectContext.Provider value={paintValue}>
      <GroupedList
        data={options}
        className={clsx("divide-y", className, {
          "cursor-pointer": !!paintValue,
        })}
        groupDefs={groupDefinitions}
        itemRender={({ item }) => (
          <Row
            value={item.value}
            onChange={(newValue) => {
              setPaintValue(newValue);
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
    </OptionMultiSelectContext.Provider>
  );
};
