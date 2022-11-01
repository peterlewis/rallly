import clsx from "clsx";

export type GroupDefinition<O extends Record<string, unknown> = {}> = {
  groupBy: (a: O) => string;
  className?: string;
  itemsClassName?: string;
  render: React.ComponentType<{ value: string }>;
};

type Group<T> = {
  key: string;
  groups?: Group<T>[];
  render: React.ComponentType;
  className?: string;
  itemsClassName?: string;
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
          key: groupKey,
          render() {
            return <groupDef.render value={groupKey} />;
          },
          className: groupDef.className,
          itemsClassName: groupDef.itemsClassName,
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
  groupsClassName,
}: {
  data: T[];
  className?: string;
  groupsClassName?: string;
  groupDefs: Array<GroupDefinition<T>>;
  itemRender: React.ComponentType<{ item: T }>;
}) => {
  const groups = useDefineGroups(data, groupDefs);
  const renderGroup = (group: Group<T>) => {
    return (
      <div key={group.key} className={clsx(groupsClassName, group.className)}>
        <group.render />
        <div className={group.itemsClassName}>
          {group.groups
            ? group.groups.map(renderGroup)
            : group.items.map((item, i) => <Item key={i} item={item} />)}
        </div>
      </div>
    );
  };

  return <div className={className}>{groups.map(renderGroup)}</div>;
};
