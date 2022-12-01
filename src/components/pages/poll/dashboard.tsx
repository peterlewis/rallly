import { useParticipants, usePoll } from "../participant-page/poll-context";
import { TargetTimezoneProvider } from "../participant-page/target-timezone";
import { Empty } from "./dashboard/empty";
import { Results } from "./dashboard/results";

export const Dashbaord = () => {
  const poll = usePoll();
  const { participants } = useParticipants();
  return (
    <TargetTimezoneProvider>
      <div className="p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-xl font-semibold">{poll.title}</div>
          {participants.length === 0 ? <Empty /> : <Results />}
        </div>
      </div>
    </TargetTimezoneProvider>
  );
};
