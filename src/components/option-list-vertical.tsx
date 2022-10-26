import { VoteType } from "@prisma/client";
import clsx from "clsx";

import Clock from "@/components/icons/clock.svg";

import { getDuration } from "../utils/date-time-utils";
import { useDayjs } from "../utils/dayjs";
import VoteIcon from "./poll/vote-icon";

type Option =
  | {
      yesCount: number;
      ifNeedBeCount: number;
      noCount: number;
    } & (
      | {
          type: "date";
          date: string;
        }
      | {
          type: "time";
          start: string;
          end: string;
        }
    );

// const useDefineOptionGroups = (
//   options: Option[],
//   groupBy?: "date" | "score",
// ): { groupDefs: GroupDefinition[] } => {
//   const { dayjs } = useDayjs();
//   const groupDefs: Record<string, GroupDefinition<Option>> = {};

//   for (let i = 0; i < options.length; i++) {
//     const item = options[i];
//     // TODO (Luke Vella) [2022-10-21]: Implement group by score
//     const groupKey =
//       item.type === "date"
//         ? dayjs(item.date).format("MMMM YYYY")
//         : dayjs(item.start).format("LL");

//     if (groupDefs[groupKey]) {
//       groupDefs[groupKey].items.push(item);
//     } else {
//       groupDefs[groupKey] = {
//         key: groupKey,
//         render() {
//           if (item.type === "date") {
//             const date = dayjs(item.date);
//             return <div>{date.format("LL")}</div>;
//           }

//           const date = dayjs(item.start);
//           return <div>{date.format("LLL")}</div>;
//         },
//         items: [item],
//       };
//     }
//   }
//   return { groupDefs: Object.values(groupDefs) };
// };

// export const createGroupDefinitionHelper = <
//   O extends Record<string, unknown>,
// >() => {
//   return <F extends keyof O>(
//     field: F,
//     groupDefinition: GroupDefinition<O, F>,
//   ) => {
//     return {
//       field,
//       ...groupDefinition,
//     };
//   };
// };

// const createGroupDefinition = createGroupDefinitionHelper<{ x: "foo"; y: 1 }>();

type GroupDefinition<O extends Record<string, unknown> = {}> = {
  groupBy: (a: O) => string;
  className?: string;
  render: (props: { value: string }) => JSX.Element;
};

type Group<T> = {
  groups?: Group<T>[];
  render: React.ComponentType;
  className?: string;
  items: T[];
};

const useDefineGroups = <T extends Record<string, unknown>>(
  data: T[],
  groupDefs: GroupDefinition<T>[],
): Array<Group<T>> => {
  const createGroups = (
    data: T[],
    [groupDef, ...otherGroupDefs]: GroupDefinition<T>[],
  ) => {
    const r: Array<Group<T>> = [];
    const itemsByGroup: Record<string, Group<T>> = {};
    data.forEach((item) => {
      const groupKey = groupDef.groupBy(item);
      if (itemsByGroup[groupKey]) {
        itemsByGroup[groupKey].items.push(item);
      } else {
        itemsByGroup[groupKey] = {
          render() {
            return <groupDef.render value={groupKey} />;
          },
          className: groupDef.className,
          items: [item],
        };
      }
    });

    Object.values(itemsByGroup).forEach((group) => {
      if (otherGroupDefs.length > 0) {
        group.groups = createGroups(group.items, otherGroupDefs);
      }
    });

    r.push(...Object.values(itemsByGroup));

    return r;
  };

  return createGroups(data, groupDefs);
};

export const GroupedList = <T extends Record<string, unknown>>({
  className,
  data,
  groupDefs,
  itemRender: Item,
  itemsClassName,
  groupsClassName,
}: {
  data: T[];
  className?: string;
  itemsClassName?: string;
  groupsClassName?: string;
  groupDefs: Array<GroupDefinition<T>>;
  itemRender: React.ComponentType<{ item: T }>;
}) => {
  const groups = useDefineGroups(data, groupDefs);
  const renderGroup = (group: Group<T>) => {
    return (
      <div className={group.className}>
        <group.render />
        {group.groups ? (
          <div className={groupsClassName}>{group.groups.map(renderGroup)}</div>
        ) : (
          <div className="p-2">
            <div className={itemsClassName}>
              {group.items.map((item, i) => (
                <Item key={i} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return <div className={className}>{groups.map(renderGroup)}</div>;
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

export const OptionListResultHorizontal: React.VoidFunctionComponent<{
  item: OptionWithResults;
}> = ({ item }) => {
  return (
    <div className="grow">
      <div className="flex h-28 items-center justify-center p-4">
        <FormattedOptionHorizontal item={item} />
      </div>
      <div className="pb-1">
        {item.votes.map((vote, i) => {
          return (
            <div className="h-12 p-1" key={i}>
              <div
                className={clsx(
                  "flex h-full w-full items-center  justify-center",
                  {
                    "bg-green-400/20": vote === "yes",
                    "bg-amber-300/30": vote === "ifNeedBe",
                    "bg-slate-200/20": vote === "no" || !vote,
                  },
                )}
              >
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
