import { VoteType } from "@prisma/client";

export type DateOption = {
  type: "date";
  date: string;
};

export type TimeOption = {
  type: "time";
  start: string;
  end: string;
};

type GridResult = {
  votes: Array<VoteType | undefined>;
  namesByVote: Record<VoteType, string[]>;
  yesCount: number;
  ifNeedBeCount: number;
  noCount: number;
};

export type DateOptionResult = DateOption & GridResult;

export type TimeOptionResult = TimeOption & GridResult;
