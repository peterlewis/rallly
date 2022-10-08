import React from "react";

import { ScrollSync } from "../scroll-sync";
import { useRequiredContext } from "../use-required-context";
import { PollState } from "./grid-view-poll";
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

interface PollStateContextValue {
  state: PollState;
  setState: React.Dispatch<React.SetStateAction<PollState>>;
}

const PollStateContext =
  React.createContext<PollStateContextValue | null>(null);

const usePollStateContext = (): PollStateContextValue => {
  const context = useRequiredContext(PollStateContext, "PollStateContext");

  return context;
};

const GridPollHeaderCreate: React.VoidFunctionComponent<{
  value?: PollValue;
  onChange: (value: PollValue) => void;
}> = () => {
  return <div>Create header</div>;
};

const GridPollHeaderEdit: React.VoidFunctionComponent<{
  name: string;
  value?: PollValue;
  onChange: (value: PollValue) => void;
}> = () => {
  return <div>Edit header</div>;
};

const GridPollHeader = () => {
  const { state, setState } = usePollStateContext();
  switch (state.type) {
    case "create":
      return (
        <GridPollHeaderCreate
          value={state.votes}
          onChange={(votes) => {
            setState({ ...state, votes });
          }}
        />
      );
    case "edit":
      return (
        <GridPollHeaderEdit
          name={state.name}
          value={state.votes}
          onChange={(votes) => {
            setState({ ...state, votes });
          }}
        />
      );
    default:
      return <div>Deault header</div>;
  }
};

const GridPollBody: React.VoidFunctionComponent = () => {
  return <div>body</div>;
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
