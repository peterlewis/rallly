import { Group } from "framer-motion/types/components/Reorder/Group";

import { useDayjs } from "../utils/dayjs";

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

export const createGroupDefinitionHelper = <
  O extends Record<string, unknown>,
>() => {
  return <F extends keyof O>(
    field: F,
    groupDefinition: GroupDefinition<O, F>,
  ) => {
    return {
      field,
      ...groupDefinition,
    };
  };
};

const createGroupDefinition = createGroupDefinitionHelper<{ x: "foo"; y: 1 }>();

const x = createGroupDefinition("x", {
  render({ value }) {
    return <div>{value}</div>;
  },
});

type GroupDefinition<
  O extends Record<string, unknown> = {},
  F extends keyof O = keyof O,
> = {
  render: React.ComponentType<{ value: O[F] }>;
};

const g: GroupDefinition<{ x: string; y: number }> = {
  field: "x",
  render: ({ field, value }) => {},
};

const useDefineGroups = <T extends Record<string, unknown>>(
  data: T[],
  groupDefs: GroupDefinition<T>[],
) => {};

export const GroupedList = <T extends Record<string, unknown>>({
  className,
  data,
  groupDefs,
}: {
  data: T[];
  className?: string;
  groupDefs: Array<GroupDefinition<T>>;
  itemRender: React.ComponentType<{ item: T }>;
}) => {
  const groups = useDefineGroups(data, groupDefs);

  return <div className={className}></div>;
};

const Test = () => {
  return (
    <GroupedList
      data={[
        {
          monthYear: "2022-03",
          type: "date",
          day: "2022-03-01",
          start: "2022-03-01T08:00",
          end: "2022-03-01T09:00",
          score: "5/4/1",
          yesCount: 5,
        },
      ]}
      groupDefs={[
        {
          field: "score",
          render({ field, value }) {
            return <div>{value}</div>;
          },
        },
        {
          field: "monthYear",
          render({ value }) {
            return <div>{value}</div>;
          },
        },
        {
          field: "day",
          render({ value }) {
            return <div>{value}</div>;
          },
        },
      ]}
      itemRender={({ item }) => {
        return <div>{item.type}</div>;
      }}
    />
  );
};
