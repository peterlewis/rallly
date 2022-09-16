import UserAvatar from "./poll/user-avatar";
import Tooltip from "./tooltip";

export const SummarizedParticipantBubbles: React.VoidFunctionComponent<{
  participants: string[];
}> = ({ participants }) => {
  if (!participants.length) {
    return null;
  }

  return (
    <div className="flex -space-x-1">
      {participants
        .slice(0, participants.length <= 8 ? 8 : 7)
        .map((participantName, i) => {
          return (
            <Tooltip key={i} content={participantName}>
              <UserAvatar
                className="ring-1 ring-white"
                name={participantName}
              />
            </Tooltip>
          );
        })}
      {participants.length > 8 ? (
        <span className="inline-flex h-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-400 ring-1 ring-white">
          +{participants.length - 7}
        </span>
      ) : null}
    </div>
  );
};
