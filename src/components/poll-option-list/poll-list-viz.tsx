import { VoteType } from "@prisma/client";
import clsx from "clsx";

import { useDayjs } from "../../utils/dayjs";
import UserAvatar from "../poll/user-avatar";
import VoteIcon from "../poll/vote-icon";
import { DateOptionResult, TimeOption, TimeOptionResult } from "./types";
import {
  DateOptionListVertical,
  TimeOptionListVertical,
} from "./vertical-list";

const DateRow = () => {
  return <div>date row</div>;
};

const TimeRow: React.VoidFunctionComponent<{ item: TimeOption }> = ({
  item,
}) => {
  const { dayjs } = useDayjs();
  const start = dayjs(item.start).format("LT");
  const end = dayjs(item.end).format("LT");
  return <div className="text-xl font-light">{`${start} - ${end}`}</div>;
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

const TimeRowResult: React.VoidFunctionComponent<{ item: TimeOptionResult }> =
  ({ item }) => {
    return (
      <div className="p-6">
        <TimeRow item={item} />
        <div className="mt-4 grid grid-cols-2 gap-x-4 py-3">
          <div className="col-span-1 space-y-2">
            {item.namesByVote.yes.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="yes" />
            ))}
          </div>
          <div className="col-span-1 space-y-2">
            {item.namesByVote.ifNeedBe.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="ifNeedBe" />
            ))}
            {item.namesByVote.no.map((name, i) => (
              <ParticipantSummaryItem key={i} name={name} vote="no" />
            ))}
          </div>
        </div>
      </div>
    );
  };

export const PollListViz = (
  props: { className?: string } & (
    | {
        type: "date";
        data: DateOptionResult[];
      }
    | { type: "time"; data: TimeOptionResult[] }
  ),
) => {
  const className = clsx(props.className);

  switch (props.type) {
    case "date":
      return (
        <DateOptionListVertical
          className={className}
          data={props.data}
          itemRender={DateRow}
        />
      );
    case "time":
      return (
        <TimeOptionListVertical
          className={className}
          data={props.data}
          itemRender={TimeRowResult}
        />
      );
  }
};
