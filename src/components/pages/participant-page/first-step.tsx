import { VoteType } from "@prisma/client";
import React from "react";

import { EventDetails } from "./event-details";
import { ParticipantsContextProvider } from "./participants-context";
import { Poll } from "./poll";
import { usePoll } from "./poll-context";
import { Results } from "./results";

type Option = {
  vote?: VoteType;
  id: string;
};

type FirstStepForm = {
  value: Option[];
};

export const FirstStep: React.VoidFunctionComponent<{
  votes?: Record<string, VoteType>;
  onSubmit: (value: FirstStepForm) => void;
}> = () => {
  const data = usePoll();

  return (
    <ParticipantsContextProvider
      seed={data.id}
      participants={data.participants}
    >
      <div className="space-y-4">
        {/* <Results /> */}
        <Poll />
      </div>
    </ParticipantsContextProvider>
  );
};
