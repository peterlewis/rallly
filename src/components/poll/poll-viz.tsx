import { VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import React from "react";
import toast from "react-hot-toast";

import { getBrowserTimeZone, parseValue } from "../../utils/date-time-utils";
import { useDayjs } from "../../utils/dayjs";
import { trpc } from "../../utils/trpc";
import ModalProvider, { useModalContext } from "../modal/modal-provider";
import { useParticipants } from "../participants-provider";
import { usePoll } from "../poll-provider";
import { useRequiredContext } from "../use-required-context";
import { useUser } from "../user-provider";
import { ChangeNameModal } from "./change-name-modal";
import { PollState } from "./grid-view-poll";
import { NewParticipantModal } from "./new-participant-modal";
import { PollVizGrid } from "./poll-viz/grid";
import { PollValue, PollViewOption, PollViewParticipant } from "./types";

// this config should be in the url
type PollVizConfig = {
  style: "grid" | "list";
  targetTimezone: string;
};

type PollConfig = {
  style: "grid" | "list";
  defaultState: PollState;
  participants: PollViewParticipant[];
  options: PollViewOption[];
  canCreateParticipant?: boolean;
  onChangeName?: (participantId: string, newName: string) => Promise<void>;
  onAddParticipant?: (name: string, votes: PollValue) => Promise<string>;
  onUpdateParticipant?: (
    participantId: string,
    votes: PollValue,
  ) => Promise<void>;
  onDeleteParticipant?: (participantId: string) => Promise<void>;
  onSelectOption?: (optionId: string) => void;
};

const usePollState = (config: PollConfig): PollStateContextValue => {
  const [state, setState] = React.useState<PollState>(config.defaultState);

  const modalContext = useModalContext();
  const { t } = useTranslation("app");
  const resetState = React.useCallback(() => {
    setState(config.defaultState);
  }, [config.defaultState]);

  const getParticipant = React.useCallback(
    (participantId: string): PollViewParticipant => {
      const participant = config.participants.find(
        ({ id }) => id === participantId,
      );

      if (!participant) {
        throw new Error("Tried to access a participant that doesn't exist");
      }

      return participant;
    },
    [config.participants],
  );

  // Make sure we don't end up an in an invalid state, example: selecting a participant that doesn't exist
  const sanitizedState = React.useMemo(() => {
    if ("participantId" in state) {
      const participant = getParticipant(state.participantId);
      if (!participant) {
        return config.defaultState;
      }
    }
    return state;
  }, [config.defaultState, getParticipant, state]);

  return {
    state: sanitizedState,
    setState,
    config,
    participants: config.participants,
    options: config.options,
    getParticipant,
    createParticipant: (votes) => {
      modalContext.render({
        footer: null,
        showClose: true,
        content: function Content({ close }) {
          return (
            <NewParticipantModal
              votes={votes}
              options={config.options}
              onCancel={close}
              onSubmit={async ({ name, votes }) => {
                const participantId = await config.onAddParticipant?.(
                  name,
                  votes,
                );
                if (participantId) {
                  setState({ type: "select", participantId });
                }
              }}
            />
          );
        },
      });
    },
    updateParticipant: async (participantId, votes) => {
      await config.onUpdateParticipant?.(participantId, votes);
      setState({ type: "select", participantId });
    },
    deleteParticipant: async (participantId) => {
      const participant = getParticipant(participantId);
      modalContext.render({
        title: t("deleteParticipantDialog", { name: participant.name }),
        description:
          "Are you sure you want to remove this participant from the poll?",
        okButtonProps: {
          type: "danger",
        },
        okText: t("delete"),
        onOk: async () => {
          resetState();
          await config.onDeleteParticipant?.(participantId);
        },
        cancelText: t("cancel"),
      });
    },
    selectParticipant: (participantId: string | null) => {
      if (participantId === null) {
        setState(config.defaultState);
      } else {
        setState({
          type: "select",
          participantId,
        });
      }
    },
    renameParticipant: (participantId: string) => {
      const participant = getParticipant(participantId);
      modalContext.render({
        footer: null,
        showClose: true,
        overlayClosable: true,
        content: function Content({ close }) {
          return (
            <ChangeNameModal
              currentName={participant.name}
              onSubmit={async (newName) => {
                await config.onChangeName?.(participant.id, newName);
                close();
              }}
              onCancel={close}
            />
          );
        },
      });
    },
    editParticipant: (participantId: string) => {
      const participant = getParticipant(participantId);
      setState({
        type: "edit",
        participantId,
        name: participant.name,
        votes: participant.voteByOptionId,
      });
    },
    resetState,
  };
};

interface PollStateContextValue {
  state: PollState;
  setState: React.Dispatch<React.SetStateAction<PollState>>;
  resetState: () => void;
  config: PollConfig;
  participants: PollViewParticipant[];
  options: PollViewOption[];
  renameParticipant: (participantId: string) => void;
  getParticipant: (participantId: string) => PollViewParticipant;
  selectParticipant: (participantId: string | null) => void;
  createParticipant: (votes: PollValue) => void;
  updateParticipant: (participantId: string, votes: PollValue) => void;
  deleteParticipant: (participantId: string) => void;
  editParticipant: (participant: string) => void;
}

const PollStateContext =
  React.createContext<PollStateContextValue | null>(null);

export const usePollStateContext = (): PollStateContextValue => {
  const context = useRequiredContext(PollStateContext, "PollStateContext");

  return context;
};

export const PollViz: React.VoidFunctionComponent<PollConfig> = (props) => {
  const context = usePollState(props);

  return (
    <PollStateContext.Provider value={context}>
      <PollVizGrid />
    </PollStateContext.Provider>
  );
};

const normalizeVotes = (votes: PollValue, options: PollViewOption[]) => {
  return options.map((option) => ({
    optionId: option.id,
    type: votes[option.id] ?? "no",
  }));
};

export const ConnectedPollViz: React.VoidFunctionComponent = () => {
  const [preferences, setPreferences] = React.useState<PollVizConfig>({
    style: "grid",
    targetTimezone: getBrowserTimeZone(),
  });

  const { t } = useTranslation("app");
  const { participants } = useParticipants();
  const { poll } = usePoll();
  const { dayjs } = useDayjs();
  const { user } = useUser();

  const pollOptions: PollViewOption[] = React.useMemo(
    () =>
      poll.options.map((option, index) => {
        const score = participants.reduce((acc, curr) => {
          const vote = curr.votes.find((vote) => vote.optionId === option.id);
          if (vote?.type === "yes") {
            acc += 1;
          }
          return acc;
        }, 0);

        const parsedOption = parseValue(option.value);

        if (parsedOption.type === "time") {
          const { start, end } = parsedOption;
          let startTime = dayjs(start);
          let endTime = dayjs(end);
          if (poll.timeZone) {
            startTime = startTime
              .tz(poll.timeZone)
              .tz(preferences.targetTimezone);
            endTime = endTime.tz(poll.timeZone).tz(preferences.targetTimezone);
          }
          return {
            id: option.id,
            type: "time",
            i18nDate: startTime.format("LLL"),
            index,
            start: startTime.format("YYYY-MM-DDTHH:mm"),
            end: endTime.format("YYYY-MM-DDTHH:mm"),
            score,
          };
        }

        return {
          id: option.id,
          type: "date",
          i18nDate: dayjs(parsedOption.date).format("LL"),
          index,
          date: parsedOption.date,
          score,
        };
      }),
    [
      dayjs,
      participants,
      poll.options,
      poll.timeZone,
      preferences.targetTimezone,
    ],
  );

  const pollParticipants = React.useMemo(
    () =>
      participants.map(({ id, name, votes, userId: participantUserId }) => {
        const isYou = user.id === participantUserId;
        const voteByOptionId: Record<string, VoteType | undefined> = {};
        votes.forEach((vote) => {
          voteByOptionId[vote.optionId] = vote.type;
        });
        return {
          id,
          name,
          votes: poll.options.map((option) => {
            return votes.find((vote) => vote.optionId === option.id)?.type;
          }),
          voteByOptionId,
          you: isYou,
          editable: poll.admin || isYou,
        };
      }),
    [participants, poll.admin, poll.options, user.id],
  );

  const pollId = poll.id;

  const queryClient = trpc.useContext();

  const addParticipant = trpc.useMutation("polls.participants.add", {
    onSuccess: (newParticipant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId }],
        (participants = []) => {
          return [...participants, newParticipant];
        },
      );
    },
  });

  const changeName = trpc.useMutation("polls.participants.changeName", {
    onSuccess: () => {
      queryClient.invalidateQueries(["polls.participants.list", { pollId }]);
      toast.success(t("saved"));
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
      toast.success(t("saved"));
    },
  });

  const deleteParticipant = trpc.useMutation("polls.participants.delete", {
    onMutate: ({ participantId, pollId }) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: pollId }],
        (existingParticipants = []) => {
          return existingParticipants.filter(({ id }) => id !== participantId);
        },
      );
    },
    onSuccess: () => {
      toast.success(t("saved"));
    },
  });

  const defaultState: PollState = React.useMemo(() => {
    if (poll.admin) {
      return { type: "read" };
    }

    const participant = pollParticipants.find((participant) => participant.you);

    if (participant) {
      return { type: "select", participantId: participant.id };
    }

    if (poll.closed) {
      return { type: "read" };
    }

    return { type: "create", votes: {} };
  }, [poll.admin, poll.closed, pollParticipants]);

  return (
    <div>
      <div>Toolbar goes here</div>
      <PollViz
        style={preferences.style}
        defaultState={defaultState}
        options={pollOptions}
        participants={pollParticipants}
        onAddParticipant={async (name, votes) => {
          const participant = await addParticipant.mutateAsync({
            pollId: poll.id,
            name,
            votes: normalizeVotes(votes, pollOptions),
          });

          return participant.id;
        }}
        onChangeName={async (participantId, newName) => {
          await changeName.mutateAsync({
            pollId,
            name: newName,
            participantId,
          });
        }}
        onUpdateParticipant={async (participantId, votes) => {
          await updateParticipant.mutateAsync({
            pollId,
            participantId,
            votes: normalizeVotes(votes, pollOptions),
          });
        }}
        onDeleteParticipant={async (participantId) => {
          await deleteParticipant.mutateAsync({ pollId, participantId });
        }}
      />
    </div>
  );
};
