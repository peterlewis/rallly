import { VoteType } from "@prisma/client";
import clsx from "clsx";

import { Button } from "../button";
import VoteIcon from "../poll/vote-icon";
import {
  DateListHorizontalItem,
  DateOptionListHorizontal,
  TimeListHorizontalItem,
  TimeOptionListHorizontal,
} from "./horizontal-list";
import { DateOptionResult, TimeOptionResult } from "./types";

const VoteScore: React.VoidFunctionComponent<{
  type: VoteType;
  count: number;
}> = ({ type, count }) => {
  return (
    <div>
      <VoteIcon type={type} />
      <div className="text-sm tabular-nums leading-none text-slate-500">
        {count}
      </div>
    </div>
  );
};

const GridColumn: React.VoidFunctionComponent<{
  votes: Array<VoteType | undefined>;
  namesByVote: Record<VoteType, string[]>;
  children?: React.ReactNode;
}> = ({ children, votes, namesByVote }) => {
  return (
    <div className="">
      {children}
      <div>
        {votes.map((vote, i) => {
          return (
            <div className="h-12" key={i}>
              <div
                className={clsx(
                  "flex h-full w-full items-center justify-center ring-inset",
                  {
                    "border-green-600/10 bg-green-400/20": vote === "yes",
                    "border-amber-500/20 bg-amber-300/30": vote === "ifNeedBe",
                    "border-slate-400/20 bg-slate-200/20":
                      vote === "no" || !vote,
                  },
                )}
              >
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-1 text-center">
        <div className="mb-3 mt-2 space-y-2 px-2">
          <VoteScore type="yes" count={namesByVote.yes.length} />
          <VoteScore type="ifNeedBe" count={namesByVote.ifNeedBe.length} />
          <VoteScore type="no" count={namesByVote.no.length} />
        </div>
      </div>
    </div>
  );
};

const TimeColumn: React.VoidFunctionComponent<{ item: TimeOptionResult }> = ({
  item,
}) => {
  return (
    <GridColumn votes={item.votes} namesByVote={item.namesByVote}>
      <TimeListHorizontalItem item={item} />
    </GridColumn>
  );
};

const DateColumn: React.VoidFunctionComponent<{ item: DateOptionResult }> = ({
  item,
}) => {
  return (
    <GridColumn votes={item.votes} namesByVote={item.namesByVote}>
      <DateListHorizontalItem item={item} />
    </GridColumn>
  );
};

export const PollGridViz = (
  props: {
    className?: string;
    participants: Array<{ id: string; name: string }>;
  } & (
    | {
        type: "date";
        data: DateOptionResult[];
      }
    | { type: "time"; data: TimeOptionResult[] }
  ),
) => {
  const className = clsx("flex", props.className);

  return (
    <div className="relative flex overflow-auto rounded-md border bg-gray-100">
      {(() => {
        switch (props.type) {
          case "date":
            return (
              <DateOptionListHorizontal
                className={className}
                data={props.data}
                itemRender={DateColumn}
              />
            );
          case "time":
            return (
              <TimeOptionListHorizontal
                className={className}
                data={props.data}
                itemRender={TimeColumn}
              />
            );
        }
      })()}
    </div>
  );
};
