import { Participant, Vote, VoteType } from "@prisma/client";
import clsx from "clsx";
import dayjs from "dayjs";
import * as React from "react";

import ArrowsPointingIn from "@/components/icons/arrows-pointing-in.svg";
import ArrowsPointingOut from "@/components/icons/arrows-pointing-out.svg";
import Menu from "@/components/icons/menu.svg";
import Table from "@/components/icons/table.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { trpc } from "../../utils/trpc";
import { PollOption } from "../../utils/trpc/types";
import { useWideScreen } from "../../utils/use-wide-screen";
import { useTimeZones } from "../time-zone-picker/time-zone-picker";
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

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    children?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
  }
>(function ToolbarButton(
  { className, icon: Icon, active, children, ...forwardProps },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex h-8 items-center space-x-1 px-2 ",
        {
          "text-primary-500": active,
          "text-slate-600/75 hover:bg-slate-500/5 hover:text-slate-600 active:bg-gray-100":
            !active,
        },
        className,
      )}
      {...forwardProps}
    >
      {Icon ? <Icon className="h-4" /> : null}
      {children ? <span className="text-sm">{children}</span> : null}
    </button>
  );
});

const ToolbarGroup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex overflow-hidden rounded-md border bg-white shadow-sm">
      {children}
    </div>
  );
};

export const PollDataProvider: React.VoidFunctionComponent<{
  timeZone: string | null;
  admin?: boolean;
  pollId: string;
  options: PollOption[];
  participants: Array<Participant & { votes: Vote[] }>;
}> = ({ options, participants, timeZone, pollId, admin }) => {
  const { user } = useUser();

  const userId = user.id;

  const { findFuzzyTz } = useTimeZones();

  const [targetTimeZone, setTargetTimeZone] = React.useState(
    () => findFuzzyTz(getBrowserTimeZone()).value,
  );

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

  const [preferredView, setPreferredView] = React.useState("table");

  const view = isWideScreen ? preferredView : "list";

  const Compononent = view === "table" ? TableViewPoll : MobilePoll;

  const [isExpanded, setExpanded] = React.useState(false);

  return (
    <PollDataContext.Provider value={contextValue}>
      <div className="mx-auto mb-4 flex max-w-4xl space-x-4 px-4">
        {timeZone ? (
          <ToolbarGroup>
            <ToolbarButton>{targetTimeZone}</ToolbarButton>
          </ToolbarGroup>
        ) : null}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => {
              setPreferredView("table");
            }}
            active={preferredView === "table"}
            icon={Table}
          >
            Table
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              setPreferredView("list");
            }}
            active={preferredView === "list"}
            icon={Menu}
          >
            List
          </ToolbarButton>
        </ToolbarGroup>
        {view === "table" ? (
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => {
                setExpanded(!isExpanded);
              }}
              icon={isExpanded ? ArrowsPointingIn : ArrowsPointingOut}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </ToolbarButton>
          </ToolbarGroup>
        ) : null}
      </div>
      <div
        className={clsx("sm:px-4", {
          "mx-auto max-w-4xl": !isExpanded || view !== "table",
        })}
      >
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
