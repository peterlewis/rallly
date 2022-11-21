import { VoteType } from "@prisma/client";
import React from "react";

export const VotesContext = React.createContext<
  {
    optionId: string;
    participantId: string;
    vote: VoteType;
  }[]
>([]);
