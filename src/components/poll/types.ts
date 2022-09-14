import { VoteType } from "@prisma/client";

export interface ParticipantForm {
  name: string;
  votes: Array<VoteType | undefined>;
}

export type PollViewOption =
  | {
      id: string;
      type: "date";
      date: string;
      score: number;
    }
  | {
      id: string;
      type: "time";
      start: string;
      end: string;
      score: number;
    };

export interface PollViewParticipant {
  id: string;
  name: string;
  votes: Array<VoteType | undefined>;
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
