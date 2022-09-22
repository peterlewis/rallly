import { VoteType } from "@prisma/client";

export interface ParticipantForm {
  name: string;
  votes: Array<VoteType | undefined>;
}

export type PollViewOption = {
  id: string;
  score: number;
} & (
  | {
      type: "date";
      date: string;
    }
  | {
      type: "time";
      start: string;
      end: string;
    }
);

export interface PollViewParticipant {
  id: string;
  name: string;
  votes: Array<VoteType | undefined>; // TODO (Luke Vella) [2022-09-21]: Remove this?
  voteByOptionId: Record<string, VoteType | undefined>;
  editable?: boolean;
  you?: boolean;
}

export type PollValue = Record<string, VoteType | undefined>;

export interface PollProps {
  options: PollViewOption[];
  participants: PollViewParticipant[];
  value?: PollValue;
  onChange?: (value: PollValue) => void;
}
