import produce from "immer";
import React from "react";

import config from "../../../playwright.config";
import { ScrollSync } from "../scroll-sync";
import { useRequiredContext } from "../use-required-context";
import { PollState, PollStateCreate } from "./grid-view-poll";
import { PollValue, PollViewOption, PollViewParticipant } from "./types";

type PollConfig = {
  canCreateParticipant?: boolean;
  participants: PollViewParticipant[];
  options: PollViewOption[];
  defaultState: PollState;
  onChangeName?: (participantId: string) => void;
  onAddParticipant?: (votes: PollValue) => void;
  onEditParticipant?: (participantId: string, votes: PollValue) => void;
  onDeleteParticipant?: (participantId: string) => void;
  onSelectOption?: (optionId: string) => void;
};

const usePollState = (config: PollConfig) => {
  const [state, setState] = React.useState<PollState>(config.defaultState);

  const getParticipant = React.useCallback(
    (
      participantId: string,
      callback?: (participant: PollViewParticipant) => void,
    ) => {
      const participant = config.participants.find(
        ({ id }) => id === participantId,
      );

      if (participant) {
        callback?.(participant);
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
    getParticipant,
    addParticipant: () => {
      setState({
        type: "create",
        votes: {},
      });
    },
    selectParticipant: (participantId: string) => {
      setState({
        type: "select",
        participantId,
      });
    },
    editParticipant: (participantId: string) => {
      getParticipant(participantId, (participant) => {
        setState({
          type: "edit",
          participantId,
          name: participant.name,
          votes: participant.voteByOptionId,
        });
      });
    },
  };
};

interface PollStateContextValue<
  T extends PollState["type"] = PollState["type"],
  S = PollState & { type: T },
> {
  state: S;
  setState: React.Dispatch<React.SetStateAction<S>>;
}

const PollStateContext =
  React.createContext<PollStateContextValue | null>(null);

const usePollStateContext = <T extends PollState["type"] = PollState["type"]>(
  mode?: T,
): PollStateContextValue<T> => {
  const context = useRequiredContext(PollStateContext, "PollStateContext");

  if (mode && context.state.type !== mode) {
    throw new Error(
      `Expected mode to be "${mode}" but found ${context.state.type}`,
    );
  }

  return context as unknown as PollStateContextValue<T>;
};

const GridPollHeaderCreate: React.VoidFunctionComponent = () => {
  const { state, setState } = usePollStateContext("create");
  <div
    onChange={(votes) => {
      setState((s) => {
        return { s, votes };
      });
    }}
  ></div>;
};

const GridPollHeader = () => {
  const { state, setState } = usePollStateContext();
  switch (state.type) {
    case "create":
      <GridPollHeaderCreate state={state} />;
  }
};

const GridPoll: React.VoidFunctionComponent = () => {
  return (
    <div>
      <ScrollSync>
        <GridPollHeader />
        <GridPollBody />
      </ScrollSync>
    </div>
  );
};

export const Poll: React.VoidFunctionComponent = () => {
  const context = usePollState({
    participants: [],
    options: [],
    defaultState: {
      type: "read",
    },
  });
  return (
    <PollStateContext.Provider value={context}>
      <GridPoll />
    </PollStateContext.Provider>
  );
};
