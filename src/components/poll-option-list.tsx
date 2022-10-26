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
