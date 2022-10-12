import { VoteType } from "@prisma/client";

import { PollValue, PollViewOption } from "./types";

export const groupByVoteType = (
  options: PollViewOption[],
  votes: PollValue,
) => {
  const res: Record<VoteType, PollViewOption[]> = {
    yes: [],
    ifNeedBe: [],
    no: [],
  };
  options.forEach((option) => {
    const vote = votes[option.id];
    if (vote && vote !== "no") {
      res[vote].push(option);
    } else {
      res.no.push(option);
    }
  });
  return res;
};
