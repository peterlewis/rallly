import React from "react";

export const ParticipantsContext = React.createContext<
  Array<{
    id: string;
    name: string;
    color: string;
    userId: string;
  }>
>([]);

const colors = [
  "bg-violet-400",
  "bg-sky-400",
  "bg-blue-400",
  "bg-fuchsia-400",
  "bg-cyan-400",
  "bg-indigo-400",
  "bg-purple-400",
  "bg-pink-400",
];

export const ParticipantsContextProvider = ({
  participants,
  children,
}: {
  participants: Array<{
    id: string;
    name: string;
    createdAt: Date;
    userId: string | null; // TODO (Luke Vella) [2022-11-21]: Update db schema so that user Id cannot be null
  }>;
  children?: React.ReactNode;
}) => {
  const memoized = React.useMemo(
    () =>
      participants
        .map((participant, i) => ({
          ...participant,
          color: colors[i % colors.length],
          userId: participant.id ?? "", // TODO (Luke Vella) [2022-11-29]: Remove default to empty string once schema is updated
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [participants],
  );
  return (
    <ParticipantsContext.Provider value={memoized}>
      {children}
    </ParticipantsContext.Provider>
  );
};

export const useParticipant = (participantId: string) => {
  const participants = React.useContext(ParticipantsContext);
  const participant = participants.find(({ id }) => id === participantId);
  if (!participant) {
    throw new Error("Tried to access a participant that doesn't exist");
  }

  return participant;
};

export const useParticipants = () => {
  return React.useContext(ParticipantsContext);
};
