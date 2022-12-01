import { usePoll } from "../../participant-page/poll-context";

export const Empty = () => {
  const poll = usePoll();

  return (
    <div>
      <div>No responses yet</div>
      <div>
        Share this link with your participants to start collecting responses
      </div>
      <div>{`${window.location.origin}/p/${poll.participantUrlId}`}</div>
    </div>
  );
};
