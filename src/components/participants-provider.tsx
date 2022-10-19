import { Participant, Vote, VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { trpc } from "../utils/trpc";
import FullPageLoader from "./full-page-loader";
import { usePoll } from "./poll-provider";
import { useRequiredContext } from "./use-required-context";

const ParticipantsContext =
  React.createContext<{
    participants: Array<Participant & { votes: Vote[] }>;
    getParticipants: (optionId: string, voteType: VoteType) => Participant[];
    getParticipantsForUser: (userId: string) => Participant[];
  } | null>(null);

export const useParticipants = () => {
  return useRequiredContext(ParticipantsContext);
};

export const ParticipantsProvider: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { poll } = usePoll();
  const pollId = poll.id;
  const { t } = useTranslation("app");

  const { data: participants } = trpc.useQuery([
    "polls.participants.list",
    { pollId },
  ]);

  const getParticipants = (
    optionId: string,
    voteType: VoteType,
  ): Participant[] => {
    if (!participants) {
      return [];
    }
    return participants.filter((participant) => {
      return participant.votes.some((vote) => {
        return vote.optionId === optionId && vote.type === voteType;
      });
    });
  };

  const getParticipantsForUser = (userId: string): Participant[] => {
    return participants?.filter((p) => p.userId === userId) ?? [];
  };

  if (!participants) {
    return <FullPageLoader>{t("loadingParticipants")}</FullPageLoader>;
  }

  return (
    <ParticipantsContext.Provider
      value={{ participants, getParticipants, getParticipantsForUser }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
};
