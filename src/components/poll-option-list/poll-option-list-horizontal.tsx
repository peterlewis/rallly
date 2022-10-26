import { useDayjs } from "../../utils/dayjs";
import { GroupedList } from "../grouped-list";

type DateOption = {
  date: string;
};

type TimeOption = {
  start: string;
  end: string;
};

const GroupHeaderMonthYear: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();

  const date = dayjs(value);

  return (
    <div className="sticky left-2 z-20 mt-2  ml-2 w-12 rounded border bg-gray-100/90 p-3 text-center text-slate-600 shadow-sm shadow-sm backdrop-blur-md">
      <div className="writing-mode-vertical inline-block rotate-180 whitespace-nowrap">
        <span>{date.format("MMMM ")}</span>
        <span className="font-bold">{date.format("YYYY")}</span>
      </div>
    </div>
  );
};

const GroupHeaderDay: React.VoidFunctionComponent<{ value: string }> = ({
  value,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(value);
  return (
    <div className="sticky left-16 z-10 ml-2 mr-2 mt-2 w-14 items-end gap-1 rounded border bg-gray-100 px-3 py-2 text-center font-semibold text-slate-600 shadow-sm backdrop-blur-md">
      <div className="text-xl leading-none">{date.format("DD")}</div>
      <div className="text-sm ">{date.format("ddd")}</div>
    </div>
  );
};

export const PollOptionListHorizontalItem: React.VoidFunctionComponent<{
  item: TimeOption;
}> = ({ item }) => {};

export const PollOptionListHorizontal: React.VoidFunctionComponent<{
  data: TimeOption[];
}> = ({ data }) => {
  const { dayjs } = useDayjs();
  return (
    <GroupedList
      className="relative flex overflow-auto"
      data={data}
      itemsClassName="flex mr-2 -ml-16 relative mt-16 px-1 bg-white rounded border shadow-sm"
      groupsClassName="flex divide-x z-10"
      groupDefs={[
        {
          groupBy: (option) => option.start.substring(0, 7),
          className: "flex items-start",
          render: GroupHeaderMonthYear,
        },
        {
          groupBy: (option) => option.start.substring(0, 10),
          className: "flex items-start",
          render: GroupHeaderDay,
        },
      ]}
      itemRender={OptionListResultHorizontal}
    />
  );
};
