import { VoteType } from "@prisma/client";
import clsx from "clsx";
import produce from "immer";
import React from "react";

import ChevronDown from "@/components/icons/chevron-down.svg";
import Clock from "@/components/icons/clock.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";

import { getDuration } from "../utils/date-time-utils";
import { useDayjs } from "../utils/dayjs";
import CompactButton from "./compact-button";
import UserAvatar from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";

type GroupDefinition<T extends Record<string, unknown>> = {
  items: T[];
  header: React.ComponentType;
  key: string;
};

const useOptionDefineGroups = <T extends Option>(
  items: T[], // assumes items are sorted
  groupBy: GroupByOption = "date",
): { groupDefs: GroupDefinition<T>[] } => {
  const { dayjs } = useDayjs();
  const groupDefs: Record<string, GroupDefinition<T>> = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // TODO (Luke Vella) [2022-10-21]: Implement group by score
    const groupKey =
      item.type === "date"
        ? dayjs(item.date).format("MMMM YYYY")
        : dayjs(item.start).format("LL");

    if (groupDefs[groupKey]) {
      groupDefs[groupKey].items.push(item);
    } else {
      groupDefs[groupKey] = {
        key: groupKey,
        header() {
          if (item.type === "date") {
            const date = dayjs(item.date);
            return <div>{date.format("LL")}</div>;
          }

          const date = dayjs(item.start);
          return <div>{date.format("LLL")}</div>;
        },
        items: [item],
      };
    }
  }
  return { groupDefs: Object.values(groupDefs) };
};

const useGroupProps = (
  items: Option[], // assumes items are sorted
  groupBy: GroupByOption,
): { groups: string[]; groupCounts: number[] } => {
  const { dayjs } = useDayjs();
  const groups: string[] = [];
  const groupCounts: number[] = [];

  let currentGroup = "";
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // TODO (Luke Vella) [2022-10-21]: Implement group by score
    const groupKey =
      item.type === "date"
        ? dayjs(item.date).format("MMMM YYYY")
        : dayjs(item.start).format("LL");
    if (currentGroup !== groupKey) {
      currentGroup = groupKey;
      groups.push(groupKey);
      groupCounts.push(1);
    } else {
      groupCounts[groupCounts.length - 1]++;
    }
  }
  return { groups, groupCounts };
};

type Option =
  | {
      type: "date";
      date: string;
    }
  | {
      type: "time";
      start: string;
      end: string;
    };

type OptionWithId = Option & { id: string };

export type GroupByOption = "date" | "score";

export interface OptionListProps<T extends Option = Option> {
  items: T[];
  groupBy?: "date" | "score";
  groupClassName?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const OptionListItemDefault: React.VoidFunctionComponent<{
  item: Option;
}> = ({ item }) => {
  return (
    <div className="p-3">
      <FormattedOption item={item} />
    </div>
  );
};

export const OptionList = <T extends Option>({
  items,
  groupBy = "date",
  orientation = "vertical",
  groupClassName,
  itemContent: ItemContent,
  groupContent: GroupContent,
  className,
}: OptionListProps<T> & {
  itemContent: React.ComponentType<{ item: T }>;
  groupContent: React.ComponentType<OptionListGroupProps>;
}) => {
  const groupProps = useGroupProps(items, groupBy);
  const { groups } = groupProps;
  let pointer = -1;
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  return (
    <div
      className={clsx("relative", className, {
        "flex overflow-auto": orientation === "horizontal",
      })}
    >
      {groupProps.groupCounts.map((count, groupIndex) => {
        const groupKey = groups[groupIndex];
        const collapsedIndex = collapsed.indexOf(groupKey);
        const isCollapsed = collapsedIndex !== -1;
        if (isCollapsed) {
          pointer += count;
        }
        return (
          <div
            key={`group-${groupIndex}`}
            className={clsx({
              flex: orientation === "horizontal",
            })}
          >
            <div
              className={clsx("p-3", groupClassName, {
                "border-b": orientation === "vertical",
                "writing-mode-vertical border-r": orientation === "horizontal",
              })}
            >
              <GroupContent
                label={groupKey}
                onExpand={() => {
                  setCollapsed(
                    produce(collapsed, (draft) => {
                      draft.splice(collapsedIndex, 1);
                    }),
                  );
                }}
                onCollapse={() => {
                  setCollapsed([...collapsed, groupKey]);
                }}
                collapsed={isCollapsed}
              />
            </div>
            {!collapsed.includes(groupKey) ? (
              <div className="bg-gray-100 p-2">
                <div
                  className={clsx(
                    " overflow-hidden rounded-md border bg-white shadow-sm",
                    {
                      "flex divide-x": orientation === "horizontal",
                      "divide-y": orientation === "vertical",
                    },
                  )}
                >
                  {[...Array(count)].map(() => {
                    pointer++;
                    const item = items[pointer];
                    return <ItemContent item={item} key={`item-${pointer}`} />;
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

interface OptionListGroupProps {
  className?: string;
  label: string;
  actions?: React.ReactNode;
  onCollapse?: () => void;
  onExpand?: () => void;
  collapsed?: boolean;
}

const OptionListGroup = ({
  className,
  label,
  actions,
  collapsed,
  onCollapse,
  onExpand,
}: OptionListGroupProps) => {
  return (
    <div className={clsx("w-full", className)}>
      <div className="action-group whitespace-nowrap">
        <div
          role="button"
          className="font-medium"
          onClick={() => {
            if (collapsed) {
              onExpand?.();
            } else {
              onCollapse?.();
            }
          }}
        >
          {label}
        </div>
        {actions}
      </div>
    </div>
  );
};

interface OptionListInputProps extends OptionListProps<OptionWithId> {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const FormattedOption = <T extends Option = Option>({ item }: { item: T }) => {
  const { dayjs } = useDayjs();

  if (item.type === "date") {
    return (
      <div>
        <span className="text-xl font-bold">
          {dayjs(item.date).format("DD ")}
        </span>
        <span className="text-slate-700/75">
          {dayjs(item.date).format("dddd")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="font-semibold">{dayjs(item.start).format("LT")}</span>
      <span className="text-slate-300">&ndash;</span>
      <span className="text-slate-400">{dayjs(item.end).format("LT")}</span>
      <span className="ml-2 inline-flex items-center rounded bg-slate-400/10 px-1 text-sm leading-6 text-slate-400/75">
        <Clock className="mr-1 h-4" />
        {getDuration(item.start, item.end)}
      </span>
    </div>
  );
};

const FormattedOptionHorizontal = <T extends Option = Option>({
  item,
}: {
  item: T;
}) => {
  const { dayjs } = useDayjs();

  if (item.type === "date") {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">
          {dayjs(item.date).format("DD ")}
        </div>
        <div className="text-slate-700/75">
          {dayjs(item.date).format("ddd")}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="font-semibold">{dayjs(item.start).format("LT")}</div>
      <div className="text-slate-400">{dayjs(item.end).format("LT")}</div>
      <div className="mt-2 inline-flex items-center rounded bg-slate-400/10 px-1 text-sm leading-6 text-slate-400/75">
        <Clock className="mr-1 h-4" />
        {getDuration(item.start, item.end)}
      </div>
    </div>
  );
};

type OptionWithResults = Option & {
  yes: string[];
  ifNeedBe: string[];
  no: string[];
  votes: Array<VoteType | undefined>;
};

const ParticipantSummaryItem: React.VoidFunctionComponent<{
  name: string;
  vote: VoteType;
}> = ({ name, vote }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-5">
        <UserAvatar name={name} />
        <div className="absolute -right-2 top-0 z-10 h-3 w-3 rounded-full bg-white">
          <VoteIcon type={vote} size="sm" />
        </div>
      </div>
      <div className="text-slate-500">{name}</div>
    </div>
  );
};

const OptionListResultVertical: React.VoidFunctionComponent<{
  showParticipants?: boolean;
  item: OptionWithResults;
}> = ({ item, showParticipants }) => {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <FormattedOption item={item} />
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <VoteIcon type="yes" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.yes.length}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <VoteIcon type="ifNeedBe" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.ifNeedBe.length}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <VoteIcon type="no" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.no.length}
            </div>
          </div>
        </div>
      </div>
      {showParticipants ? (
        <div className="grid grid-cols-2 gap-x-4 py-3">
          <div className="col-span-1 space-y-2">
            {item.yes.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="yes" />
            ))}
          </div>
          <div className="col-span-1 space-y-2">
            {item.ifNeedBe.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="ifNeedBe" />
            ))}
            {item.no.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="no" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const OptionListResultHorizontal: React.VoidFunctionComponent<{
  showParticipants?: boolean;
  item: OptionWithResults;
}> = ({ item, showParticipants }) => {
  return (
    <div className="grow">
      <div className="border-b p-4">
        <div className="  ">
          <FormattedOptionHorizontal item={item} />
        </div>
      </div>
      <div className="pb-1">
        {item.votes.map((vote, i) => {
          return (
            <div className="p-1" key={i}>
              <div className="-mb-1 flex h-12 w-full items-center justify-center rounded bg-gray-50">
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 text-center">
        <div className="flex justify-center gap-1">
          <div className="mb-1">
            <VoteIcon type="yes" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.yes.length}
            </div>
          </div>
          <div className="mb-1">
            <VoteIcon type="ifNeedBe" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.ifNeedBe.length}
            </div>
          </div>
          <div className="mb-1">
            <VoteIcon type="no" />
            <div className="text-sm tabular-nums leading-none text-slate-500">
              {item.no.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OptionListResults = ({
  ...forwardProps
}: OptionListProps<OptionWithResults> & { showParticipants?: boolean }) => {
  return (
    <OptionList
      {...forwardProps}
      groupContent={OptionListGroup}
      itemContent={
        forwardProps.orientation === "vertical"
          ? OptionListResultVertical
          : OptionListResultHorizontal
      }
    />
  );
};

type ListOrientation = "horizontal" | "vertical";

interface GroupedListProps<
  T extends Record<string, unknown> = {},
  O extends ListOrientation = ListOrientation,
> {
  orientation: O;
  groupDefs: GroupDefinition<T>[];
  itemRender: React.ComponentType<{ item: T }>;
}

export const GroupedList: React.VoidFunctionComponent<GroupedListProps> = ({
  orientation,
  groupDefs,
  itemRender: ItemRender,
}) => {
  return (
    <div
      className={clsx({
        flex: orientation === "horizontal",
      })}
    >
      {groupDefs.map(({ key, header: GroupHeader, items }) => (
        <div
          key={key}
          className={clsx({
            "flex divide-x": orientation === "horizontal",
            "divide-y": orientation === "vertical",
          })}
        >
          <div>
            <GroupHeader />
          </div>
          <div
            className={clsx({
              "flex divide-x": orientation === "horizontal",
              "divide-y": orientation === "vertical",
            })}
          >
            {items.map((item, i) => (
              <ItemRender item={item} key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const OptionGroupHeader: React.VoidFunctionComponent<
  | {
      type: "date";
      date: string;
      dow: boolean;
      day: boolean;
      month: boolean;
      year: boolean;
    }
  | { type: "score"; yes: number }
> = (props) => {
  const { dayjs } = useDayjs();
  if (props.type === "date") {
    const { dow, day, month, year } = props;
    const date = dayjs(props.date);
    return (
      <div>
        <div>{dow ? date.format("ddd") : null}</div>
        <div>{day ? date.format("DD") : null}</div>
        <div>{month ? date.format("MMM") : null}</div>
        <div>{year ? date.format("YYYY") : null}</div>
      </div>
    );
  }
  return <div></div>;
};

export const GroupedOptionList: React.VoidFunctionComponent<OptionListProps> =
  ({ items, groupBy = "date", ...forwardProps }) => {
    const { groupDefs } = useOptionDefineGroups(items, groupBy);
    return (
      <GroupedList
        groupDefs={groupDefs}
        {...forwardProps}
        itemRender={({ item }) => {
          return <div>{item}</div>;
        }}
      />
    );
  };

// export const OptionListMultiSelect = ({
//   value = [],
//   items,
//   onChange,
//   ...props
// }: OptionListInputProps) => {
//   return (
//     <OptionList
//       {...props}
//       items={items}
//       groupContent={(props) => {
//         return (
//           <OptionListGroup
//             {...props}
//             actions={<CompactButton icon={DotsHorizontal} />}
//           />
//         );
//       }}
//       itemContent={({ item }) => {
//         const valueIndex = value.indexOf(item.id);
//         const isChecked = valueIndex !== -1;
//         return (
//           <div
//             role="button"
//             className={clsx(
//               "relative flex select-none items-center gap-3 py-3 pr-3 pl-4 hover:bg-slate-500/5 active:bg-slate-500/10",
//             )}
//             onClick={() => {
//               if (isChecked) {
//                 const newValue = [...value];
//                 newValue.splice(valueIndex, 1);
//                 onChange?.(newValue);
//               } else {
//                 onChange?.([...value, item.id]);
//               }
//             }}
//           >
//             {isChecked ? (
//               <span className="absolute inset-y-0 left-0 z-10 -mt-px w-1 bg-primary-500" />
//             ) : null}
//             <input
//               type="checkbox"
//               className="checkbox pointer-events-none"
//               checked={isChecked}
//             />
//             <FormattedOption item={item} />
//           </div>
//         );
//       }}
//     />
//   );
// };
