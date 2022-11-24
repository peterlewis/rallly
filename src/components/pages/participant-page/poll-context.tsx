import { VoteType } from "@prisma/client";
import dayjs from "dayjs";
import React from "react";

import { useRequiredContext } from "../../use-required-context";
import { useTargetTimezone } from "./target-timezone";

type PollContextValue = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  createdAt: Date;
  userId: string;
  user: {
    name: string;
  } | null;
  participants: {
    id: string;
    name: string;
    userId: string | null;
    votes: {
      optionId: string;
      type: VoteType;
    }[];
  }[];
  votes: {
    participantId: string;
    optionId: string;
    type: VoteType;
  }[];
  timeZone: string | null;
  options: {
    id: string;
    start: string;
    duration: number;
  }[];
};

export const PollContext = React.createContext<PollContextValue | null>(null);

export const usePoll = () => {
  return useRequiredContext(PollContext, "PollContext");
};

export const OptionsContext = React.createContext<{
  options: Record<string, { start: string; duration: number; score?: number }>;
}>({ options: {} });

export const usePollOptions = () => {
  return React.useContext(OptionsContext);
};

export const useOption = (id: string) => {
  const [targetTimezone] = useTargetTimezone();
  const { timeZone } = usePoll();

  const { options } = usePollOptions();

  const option = React.useMemo(() => {
    const o = options[id];
    if (timeZone) {
      return {
        start: dayjs(o.start)
          .tz(timeZone)
          .tz(targetTimezone)
          .format("YYYY-MM-DDTHH:mm:ss"),
        duration: o.duration,
      };
    }

    return o;
  }, [id, options, targetTimezone, timeZone]);

  return { option };
};

const colors = [
  "bg-violet-400",
  "bg-sky-400",
  "bg-cyan-400",
  "bg-blue-400",
  "bg-indigo-400",
  "bg-purple-400",
  "bg-fuchsia-400",
  "bg-pink-400",
];

export const useParticipants = () => {
  const { participants } = usePoll();
  const getParticipant = React.useCallback(
    (participantId: string) => {
      const index = participants.findIndex(
        (participant) => participant.id === participantId,
      );
      const color = colors[index % colors.length];
      return { ...participants[index], color };
    },
    [participants],
  );
  return { getParticipant };
};

export const useParticipant = (id: string) => {
  const { getParticipant } = useParticipants();
  return getParticipant(id);
};
