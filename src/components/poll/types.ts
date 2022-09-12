import { VoteType } from "@prisma/client";

export interface ParticipantForm {
  name: string;
  votes: Array<VoteType | undefined>;
}

export type PollViewOption =
  | {
      type: "date";
      date: string;
      score: number;
    }
  | {
      type: "time";
      start: string;
      end: string;
      score: number;
    };

export interface PollViewParticipant {
  id: string;
  name: string;
  votes: Array<VoteType | undefined>;
  editable?: boolean;
  you?: boolean;
}

export interface PollProps {
  options: PollViewOption[];
  activeParticipant: PollViewParticipant | null;
  onChangeActiveParticipant: (participantId: string | null) => void;
  userAlreadyVoted?: boolean;
  participants: PollViewParticipant[];
  onEntry?: (entry: ParticipantForm) => Promise<{ id: string }>;
  onUpdateEntry?: (id: string, entry: ParticipantForm) => Promise<void>;
  onDeleteEntry?: (id: string) => void;
  isBusy?: boolean;
}
