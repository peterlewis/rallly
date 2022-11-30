import { VoteType } from "@prisma/client";
import { createReducerContext } from "react-use";

import { FirstStep } from "./first-step";

type Vote = { optionId: string; vote?: VoteType };

type RouterState = {
  path: "vote" | "new" | "confirmation";
  votes: Vote[];
};

type RouterAction =
  | { type: "createNewParticipant"; votes: Vote[] }
  | { type: "participantCreated" }
  | { type: "editVotes" }
  | { type: "goBack" };

export const [useParticipantPageRouter, ParticipantPageRouterProvider] =
  createReducerContext(
    (state: RouterState, action: RouterAction): RouterState => {
      switch (action.type) {
        case "createNewParticipant":
          return {
            path: "new",
            votes: action.votes,
          };
        case "participantCreated":
          return {
            ...state,
            path: "confirmation",
          };
        case "editVotes":
          return {
            ...state,
            path: "vote",
          };
        case "goBack":
          return {
            ...state,
            path: "vote",
          };
        default:
          return state;
      }
    },
    {
      path: "vote",
      votes: [],
    },
  );
