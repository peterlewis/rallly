import { AnimatePresence, motion } from "framer-motion";
import { Trans, useTranslation } from "next-i18next";
import React from "react";

import Calendar from "@/components/icons/calendar.svg";

import { Button } from "../../button";
import Steps from "../../steps";
import { EventDetails } from "./event-details";
import {
  ParticipantDetailsForm,
  ParticipantDetailsFormData,
} from "./participant-details-form";
import { usePoll } from "./poll-context";
import { VotingForm, VotingFormData } from "./voting-form";

type NewResponseFormState = {
  step: "voting" | "enteringDetails";
  votes: VotingFormData;
  participantDetails?: ParticipantDetailsFormData;
};

type NewResponseFormAction =
  | {
      type: "voting:continue";
      votes: VotingFormData;
    }
  | {
      type: "enteringDetails:back";
      participantDetails: ParticipantDetailsFormData;
    }
  | {
      type: "enteringDetails:submit";
    };

const reducer = (
  state: NewResponseFormState,
  action: NewResponseFormAction,
): NewResponseFormState => {
  switch (action.type) {
    case "voting:continue":
      return {
        ...state,
        step: "enteringDetails",
        votes: action.votes,
      };
    case "enteringDetails:back":
      return {
        ...state,
        step: "voting",
        participantDetails: action.participantDetails,
      };
  }
  return state;
};

const AnimatedContainer: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {children}
    </motion.div>
  );
};

export const NewResponseForm = (props: { onCancel?: () => void }) => {
  const { title, user, options } = usePoll();

  const [state, dispatch] = React.useReducer(reducer, {
    step: "voting",
    votes: {
      options,
    },
  });
  const { t } = useTranslation("app");
  return (
    <div className="flex h-full flex-col divide-y">
      <div className="shrink-0 py-3 px-4">
        <Steps<NewResponseFormState["step"]>
          steps={["voting", "enteringDetails"]}
          current={state.step}
        />
      </div>
      <div className="min-h-0 grow overflow-auto ">
        <AnimatePresence initial={false} exitBeforeEnter={true}>
          {state.step === "voting" ? (
            <VotingForm
              buttonText={t("continue")}
              defaultValues={state.votes}
              onCancel={props.onCancel}
              onSubmit={(data) => {
                dispatch({ type: "voting:continue", votes: data });
              }}
            />
          ) : null}
          {state.step === "enteringDetails" ? (
            <ParticipantDetailsForm
              defaultValues={state.participantDetails}
              onBack={(participantDetails) => {
                dispatch({
                  type: "enteringDetails:back",
                  participantDetails,
                });
              }}
              onSubmit={async (data) => {
                // create participant
              }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};