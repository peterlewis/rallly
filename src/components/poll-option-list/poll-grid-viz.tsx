import { VoteType } from "@prisma/client";
import clsx from "clsx";

import { Button } from "../button";
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
    <div className="w-24 grow divide-y bg-white">
      <div className="py-3">{children}</div>
      <div className="divide-y bg-gray-50">
        {votes.map((vote, i) => {
          return (
            <div className="h-12" key={i}>
              <div
                className={clsx(
                  "flex h-full w-full items-center justify-center",
                  {
                    "border-green-600/10": vote === "yes",
                    "border-amber-500/20 ": vote === "ifNeedBe",
                    "border-slate-400/20 ": vote === "no" || !vote,
                  },
                )}
              >
                <VoteIcon type={vote} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex h-16 items-center justify-center gap-1 text-center">
        <VoteScore type="yes" count={namesByVote.yes.length} />
        {/* <VoteScore type="ifNeedBe" count={namesByVote.ifNeedBe.length} />
        <VoteScore type="no" count={namesByVote.no.length} /> */}
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
        "relative flex overflow-auto rounded border bg-white",
        props.className,
      )}
    >
      <div className="sticky left-0 z-20 flex w-48 shrink-0 flex-col justify-end divide-y border-r bg-white/80 backdrop-blur-md">
        <div className="divide-y">
          {props.participants.map((participant) => {
            return (
              <div className="flex h-12 items-center px-3" key={participant.id}>
                <UserAvatar name={participant.name} showName={true} />
              </div>
            );
          })}
        </div>
        <div className="h-16"></div>
      </div>
      <div className="grow">
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
