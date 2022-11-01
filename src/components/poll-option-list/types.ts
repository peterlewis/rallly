import { VoteType } from "@prisma/client";

export type DateOption = {
  date: string;
};

export type TimeOption = {
  start: string;
  end: string;
};

type GridResult = {
  votes: Array<VoteType | undefined>;
  namesByVote: Record<VoteType, string[]>;
};

export type DateOptionResult = DateOption & GridResult;

export type TimeOptionResult = TimeOption & GridResult;
