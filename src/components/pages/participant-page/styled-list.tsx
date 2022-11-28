import clsx from "clsx";
import React from "react";

import { useDayjs } from "../../../utils/dayjs";

export interface Option {
  id: string;
  start: string;
  duration: number;
}

const Marker: React.VoidFunctionComponent<{
  className?: string;
  children?: React.ReactNode;
}> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "sticky top-0 z-20 h-12 select-none items-center border-b bg-white/90 px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const MonthMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <Marker className="flex items-center">
      <div>
        <span className="text-lg font-bold">{dayjs(value).format("MMMM")}</span>
        <span className="text-slate-700/50">
          {dayjs(value).format(" YYYY")}
        </span>
      </div>
    </Marker>
  );
};

const DateMarker: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  return (
    <Marker className="flex justify-between">
      <div>
        <span className="text-lg font-bold">{dayjs(value).format("D")}</span>
        <span className="text-slate-700/75">{dayjs(value).format(" ddd")}</span>
      </div>
      <div className="text-slate-700/50">
        <span>{dayjs(value).format(" MMM")}</span>
        <span>{dayjs(value).format(" YYYY")}</span>
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
          <span className="text-lg font-bold">{dayjs(start).format("D")}</span>
          <span className="">{dayjs(start).format(" dddd")}</span>
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

interface IndexedItem<T> {
  item: T;
  index: number;
  children?: React.ReactNode;
}

export const StyledList = <O extends Option>({
  options,
  className,
  itemRender: Item,
}: {
  className?: string;
  options: Array<O>;
  itemRender: React.ComponentType<IndexedItem<O>>;
}) => {
  const GroupHeader = options[0].duration > 0 ? DateMarker : MonthMarker;

  const grouped = React.useMemo(() => {
    const groupBy =
      options[0].duration > 0
        ? (option: O) => option.start.substring(0, 10)
        : (option: O) => option.start.substring(0, 7);

    const itemsByGroup: Record<string, IndexedItem<O>[]> = {};
    options.forEach((item, index) => {
      const groupKey = groupBy(item);
      if (itemsByGroup[groupKey]) {
        itemsByGroup[groupKey].push({ item, index });
      } else {
        itemsByGroup[groupKey] = [{ item, index }];
      }
    });
    return Object.entries(itemsByGroup);
  }, [options]);

  return (
    <div className={clsx("divide-y", className)}>
      {grouped.map(([groupKey, rows]) => {
        return (
          <div key={groupKey}>
            <GroupHeader value={groupKey} />
            <div className="space-y-3 p-3">
              {rows.map((row) => {
                return (
                  <Item
                    key={`groupKey.${row.index}`}
                    item={row.item}
                    index={row.index}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
