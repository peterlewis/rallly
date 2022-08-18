import { Participant, Vote, VoteType } from "@prisma/client";
import dayjs from "dayjs";
import * as React from "react";

import { trpc } from "../../utils/trpc";
import { PollOption } from "../../utils/trpc/types";
import { useWideScreen } from "../../utils/use-wide-screen";
import { useRequiredContext } from "../use-required-context";
import { useUser } from "../user-provider";
import MobilePoll from "./mobile-poll";
import TableViewPoll from "./table-view-poll";
import { ParticipantInfo } from "./types";
import { useDeleteParticipantModal } from "./use-delete-participant-modal";

interface PollDataContextValue {
  participants: Participant[];
  getParticipantInfoById: (id: string) => ParticipantInfo;
  getParticipantVoteForOptionAtIndex: (
    id: string,
    index: number,
  ) => VoteType | undefined;
  getParticipantsWhoVoted: (
    type: VoteType,
    optionIndex: number,
  ) => ParticipantInfo[];
}

const PollDataContext = React.createContext<PollDataContextValue | null>(null);

export const usePollData = () => {
  return useRequiredContext(PollDataContext);
};

export const PollDataProvider: React.VoidFunctionComponent<{
  timeZone: string | null;
  admin?: boolean;
  pollId: string;
  targetTimeZone: string;
  options: PollOption[];
  participants: Array<Participant & { votes: Vote[] }>;
}> = ({ options, participants, timeZone, targetTimeZone, pollId, admin }) => {
  const { user } = useUser();

  const userId = user.id;

  const pollParticipants = participants.map(
    ({ id, name, votes, userId: participantUserId }) => {
      const isYou = userId === participantUserId;
      return {
        id,
        name,
        votes: options.map((option) => {
          return votes.find((vote) => vote.optionId === option.id)?.type;
        }),
        you: isYou,
        editable: admin || isYou,
      };
    },
  );

  const participantById = React.useMemo(() => {
    const map = new Map<string, ParticipantInfo>();
    pollParticipants.forEach((participant) => {
      map.set(participant.id, participant);
    });
    return map;
  }, [pollParticipants]);

  const getParticipantInfoById = React.useCallback(
    (id: string) => {
      const participant = participantById.get(id);
      if (!participant) {
        throw new Error(`Couldn't find participant with id ${id}`);
      }
      return participant;
    },
    [participantById],
  );

  const getParticipantVoteForOptionAtIndex = React.useCallback(
    (id: string, index: number) => {
      const participantInfo = getParticipantInfoById(id);
      return participantInfo.votes[index];
    },
    [getParticipantInfoById],
  );

  const participantsByVoteType: Array<{
    yes: ParticipantInfo[];
    no: ParticipantInfo[];
    ifNeedBe: ParticipantInfo[];
  }> = React.useMemo(() => {
    return options.map((_, index) => {
      return pollParticipants.reduce<{
        yes: ParticipantInfo[];
        no: ParticipantInfo[];
        ifNeedBe: ParticipantInfo[];
      }>(
        (acc, participant) => {
          const voteType = participant.votes[index];
          if (voteType) {
            acc[voteType].push(participant);
          }

          return acc;
        },
        { yes: [], no: [], ifNeedBe: [] },
      );
    });
  }, [options, pollParticipants]);

  const queryClient = trpc.useContext();
  const addParticipant = trpc.useMutation(["polls.participants.add"], {
    onSuccess: (participant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: participant.pollId }],
        (existingParticipants = []) => {
          return [...existingParticipants, participant];
        },
      );
    },
  });

  const updateParticipant = trpc.useMutation("polls.participants.update", {
    onSuccess: (participant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: participant.pollId }],
        (existingParticipants = []) => {
          const newParticipants = [...existingParticipants];

          const index = newParticipants.findIndex(
            ({ id }) => id === participant.id,
          );

          if (index !== -1) {
            newParticipants[index] = participant;
          }

          return newParticipants;
        },
      );
    },
  });

  const getParticipantsWhoVoted = React.useCallback(
    (type: VoteType, optionIndex: number) => {
      return participantsByVoteType[optionIndex][type];
    },
    [participantsByVoteType],
  );

  const userAlreadyVoted =
    user && participants
      ? participants.some((participant) => participant.userId === user.id)
      : false;

  const contextValue = React.useMemo<PollDataContextValue>(
    () => ({
      participants,
      getParticipantInfoById,
      getParticipantVoteForOptionAtIndex,
      getParticipantsWhoVoted,
    }),
    [
      participants,
      getParticipantInfoById,
      getParticipantVoteForOptionAtIndex,
      getParticipantsWhoVoted,
    ],
  );

  const deleteParticipant = useDeleteParticipantModal();

  const isWideScreen = useWideScreen();

  const Compononent = isWideScreen ? TableViewPoll : MobilePoll;

  return (
    <PollDataContext.Provider value={contextValue}>
      <div className="border-y bg-white sm:rounded-lg sm:border-x sm:shadow-lg">
        <Compononent
          options={options.map((option, index) => {
            const score = participants.reduce((acc, curr) => {
              const vote = curr.votes.find(
                (vote) => vote.optionId === option.id,
              );
              if (vote?.type === "yes") {
                acc += 1;
              }
              return acc;
            }, 0);

            if (option.value.type === "time") {
              const { start, end } = option.value;
              let startTime = dayjs(start);
              let endTime = dayjs(end);
              if (timeZone) {
                startTime = startTime.tz(timeZone).tz(targetTimeZone);
                endTime = endTime.tz(timeZone).tz(targetTimeZone);
              }
              return {
                type: "time",
                index,
                start: startTime.format("YYYY-MM-DDTHH:mm"),
                end: endTime.format("YYYY-MM-DDTHH:mm"),
                score,
              };
            }

            return {
              type: "date",
              index,
              date: option.value.date,
              score,
            };
          })}
          participants={pollParticipants}
          onEntry={async (participant) => {
            return await addParticipant.mutateAsync({
              pollId,
              name: participant.name,
              votes: options.map(({ id }, i) => {
                return {
                  optionId: id,
                  type: participant.votes[i] ?? "no",
                };
              }),
            });
          }}
          onDeleteEntry={deleteParticipant}
          onUpdateEntry={async (participantId, participant) => {
            await updateParticipant.mutateAsync({
              participantId,
              pollId,
              votes: options.map(({ id }, i) => {
                return {
                  optionId: id,
                  type: participant.votes[i] ?? "no",
                };
              }),
              name: participant.name,
            });
          }}
          isBusy={addParticipant.isLoading || updateParticipant.isLoading}
          userAlreadyVoted={userAlreadyVoted}
        />
      </div>
    </PollDataContext.Provider>
  );
};
