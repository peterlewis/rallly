import React from "react";

import { Confirmation } from "./confirmation";
import { ParticipantDetailsForm } from "./participant-details-form";
import { ParticipantsContextProvider } from "./participants-context";
import { Poll } from "./poll";
import { usePoll } from "./poll-context";
import { useParticipantPageRouter } from "./router";

export const FirstStep: React.VoidFunctionComponent = () => {
  const data = usePoll();
  const [state] = useParticipantPageRouter();
  return (
    <ParticipantsContextProvider participants={data.participants}>
      {state.path === "vote" ? <Poll /> : null}
    </ParticipantsContextProvider>
  );
};
