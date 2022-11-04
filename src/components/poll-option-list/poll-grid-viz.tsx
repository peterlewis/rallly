import { VoteType } from "@prisma/client";
import clsx from "clsx";

import { Button } from "../button";
import { DonutScore } from "../donut-score";
import UserAvatar from "../poll/user-avatar";
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
    <div className="w-20 grow border-slate-200">
      <div className="border-slate-200 py-3">{children}</div>
      <div className="">
        {votes.map((vote, i) => {
          return (
            <div className="h-12 border-slate-200 p-1" key={i}>
              <div
                className={clsx(
                  "flex h-full w-full items-center justify-center rounded",
                  {
                    "bg-green-50": vote === "yes",
                    "bg-amber-50": vote === "ifNeedBe",
                    "bg-slate-100": vote === "no",
                  },
                )}
              >
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex h-12 items-center justify-center">
        <DonutScore
          yes={namesByVote.yes.length}
          ifNeedBe={namesByVote.ifNeedBe.length}
          no={namesByVote.no.length}
        />
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
  return (
    <div
      className={clsx(
        "relative flex overflow-auto rounded-md border border-slate-200 bg-white",
        props.className,
      )}
    >
      <div className="sticky left-0 z-20 flex w-48 shrink-0 flex-col justify-end bg-gradient-to-r from-white to-white/0 py-6 ">
        <div className="">
          {props.participants.map((participant) => {
            return (
              <div
                className="flex h-12 items-center border-slate-200 px-3"
                key={participant.id}
              >
                <UserAvatar name={participant.name} showName={true} />
              </div>
            );
          })}
        </div>
        <div className="h-12" />
      </div>
      <div className="grow p-6">
        {(() => {
          switch (props.type) {
            case "date":
              return (
                <DateOptionListHorizontal
                  data={props.data}
                  itemRender={DateColumn}
                />
              );
            case "time":
              return (
                <TimeOptionListHorizontal
                  data={props.data}
                  itemRender={TimeColumn}
                />
              );
          }
        })()}
      </div>
    </div>
  );
};
