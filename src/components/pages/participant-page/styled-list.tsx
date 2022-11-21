import clsx from "clsx";
import React from "react";

import { useDayjs } from "../../../utils/dayjs";
import { GroupDefinition, GroupedList } from "../../grouped-list";

export interface Option {
  id: string;
  start: string;
  duration: number;
  index: number;
}

const Marker: React.VoidFunctionComponent<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="sticky top-0 z-20 -mb-px flex h-12 select-none items-center bg-gray-50/90 px-6 font-semibold text-slate-700">
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

export const StyledListItem: React.VoidFunctionComponent<{
  duration: number;
  start: string;
}> = ({ duration, start }) => {
  const { dayjs } = useDayjs();
  return (
    <div>
      {duration === 0 ? (
        <div>
          <span className="text-slate-700/90">
            {dayjs(start).format("D dddd")}
          </span>
        </div>
      ) : (
        <div className="">
          {`${dayjs(start).format("LT")} - ${dayjs(start)
            .add(duration, "minutes")
            .format("LT")}`}
        </div>
      )}
    </div>
  );
};

export const StyledList = <O extends Option>({
  options,
  className,
  itemRender,
}: {
  className?: string;
  options: Array<O>;
  itemRender: React.ComponentType<{ item: O }>;
}) => {
  const groupDefinitions = React.useMemo<GroupDefinition<O>[]>(() => {
    return options[0].duration > 0
      ? [
          {
            groupBy: (a) => a.start.substring(0, 10),
            itemsClassName: "space-y-3 pb-3 pt-1 px-3",
            render: DateMarker,
          },
        ]
      : [
          {
            groupBy: (a) => a.start.substring(0, 7),
            itemsClassName: "space-y-3 pb-3 pt-1 px-3",
            render: MonthMarker,
          },
        ];
  }, [options]);

  return (
    <GroupedList
      data={options}
      className={clsx("bg-gray-50", className)}
      groupDefs={groupDefinitions}
      itemRender={itemRender}
    />
  );
};
