import { VoteType } from "@prisma/client";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";
import React from "react";

import { trpcNext } from "../../../utils/trpc";
import { useRequiredContext } from "../../use-required-context";
import { useTargetTimezone } from "./target-timezone";

type PollContextValue = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  createdAt: Date;
  userId: string;
  user: {
    name: string;
  } | null;
  timeZone: string | null;
  participantUrlId: string;
};

export const PollContext = React.createContext<PollContextValue | null>(null);

export const usePoll = () => {
  return useRequiredContext(PollContext, "PollContext");
};

export const useOptions = () => {
  const poll = usePoll();
  const { data } = trpcNext.options.list.useQuery({ pollId: poll.id });

  return data ?? [];
};

export const useOption = (id: string) => {
  const [targetTimezone] = useTargetTimezone();
  const poll = usePoll();
  const { votes } = useVotes();
  const options = useOptions();

  const option = React.useMemo(() => {
    const option = options.find((o) => o.id === id);
    if (!option) {
      throw new Error(
        "Called useOption() with an id of an option that doesn't exist",
      );
    }
    if (poll.timeZone && option.duration > 0) {
      return {
        id: option.id,
        start: dayjs(option.start)
          .tz(poll.timeZone)
          .tz(targetTimezone)
          .format("YYYY-MM-DDTHH:mm:ss"),
        duration: option.duration,
      };
    }

    return option;
  }, [id, options, targetTimezone, poll.timeZone]);

  return { option };
};

export const useVotes = () => {
  const poll = usePoll();
  const { data = [] } = trpcNext.votes.list.useQuery({ pollId: poll.id });

  const getVotesForOption = React.useCallback(
    (optionId: string) => {
      const votesByType: Record<VoteType, string[]> = {
        yes: [],
        ifNeedBe: [],
        no: [],
      };
      const filteredVotes = [];
      for (const vote of data) {
        if (vote.optionId === optionId) {
          filteredVotes.push(vote);
          if (votesByType.hasOwnProperty(vote.type)) {
            votesByType[vote.type].push(vote.participantId);
          } else {
            votesByType[vote.type] = [vote.participantId];
          }
        }
      }
      return { votesByType, votes: filteredVotes };
    },
    [data],
  );

  const getScoreForOption = (optionId: string) => {
    return getVotesForOption(optionId).votesByType.yes.length;
  };

  return {
    votes: data,
    getVotesForOption,
    getScoreForOption,
  };
};

export const useVote = (optionId: string, participantId: string) => {
  const { votes } = useVotes();
  const vote = votes.find(
    (vote) =>
      vote.participantId === participantId && vote.optionId === optionId,
  );

  return vote;
};

const colors = [
  "bg-violet-400",
  "bg-sky-400",
  "bg-cyan-400",
  "bg-blue-400",
  "bg-indigo-400",
  "bg-purple-400",
  "bg-fuchsia-400",
  "bg-pink-400",
];

export const useParticipants = () => {
  const poll = usePoll();
  const { data: participants = [] } = trpcNext.participants.list.useQuery({
    pollId: poll.id,
  });

  const getParticipant = React.useCallback(
    (participantId: string) => {
      const index = participants.findIndex(
        (participant) => participant.id === participantId,
      );
      const color = colors[index % colors.length];
      return { ...participants[index], color };
    },
    [participants],
  );
  return { participants, getParticipant };
};

export const useParticipant = (id: string) => {
  const { getParticipant } = useParticipants();
  return getParticipant(id);
};
