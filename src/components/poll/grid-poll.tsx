import React from "react";

import {
  GridContext,
  PollState,
  useGrid,
  usePollContext,
} from "./grid-view-poll";
import { PollViewOption, PollViewParticipant } from "./types";

type CreateParticipantAction = {
  type: "createParticipant";
};

type EditParticipantAction = {
  type: "editParticipant";
  participantId: string;
};

type Action = CreateParticipantAction | EditParticipantAction;

const reducer = (state: PollState, action: Action): PollState => {
  switch (action.type) {
    case "createParticipant":
      return {
        type: "create",
      };
    case "editParticipant":
      return {
        type: "edit",
        participantId: action.participantId,
      };
    default:
      return state;
  }
};

const GridPollHeader: React.VoidFunctionComponent = () => {
  const { state, onStateChange } = usePollContext();
  switch (state.type) {
    case "create":
      return (
        <GridPollHeaderCreate
          value={state.votes}
          onChange={(votes) => onStateChange({ ...state, votes })}
        />
      );
  }
};

export const GridPoll: React.VoidFunctionComponent<{
  participants: PollViewParticipant[];
  options: PollViewOption[];
  state: PollState;
  onChange: (state: PollState) => void;
}> = ({ participants, options }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    type: "read",
  });
  const { ref, props } = useGrid<HTMLDivElement>(options.length);

  return (
    <div ref={ref}>
      <GridContext.Provider value={props}>
        <GridPollHeader />
        <GridPollBody />
      </GridContext.Provider>
    </div>
  );
};
