import Share from "@/components/icons/share.svg";

import { usePoll } from "../../participant-page/poll-context";

export const Empty = () => {
  const poll = usePoll();

  return (
    <div className="bg-pattern rounded-md border border-t-4 border-t-primary-500 bg-gray-100 px-4 py-16 text-center shadow-sm">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex items-center justify-center rounded-full bg-primary-200/25 p-4">
          <Share className="inline-block h-8 text-primary-500" />
        </div>
      </div>
      <div className="mb-4 text-xl font-semibold text-primary-500">
        No responses yet
      </div>
      <div className="mb-8 text-slate-500">
        Share this link with your participants to start collecting responses
      </div>
      <div className="flex justify-center">
        <input
          className="w-96 rounded border bg-white/50 p-2 text-lg"
          value={`${window.location.origin}/p/${poll.participantUrlId}`}
        />
      </div>
    </div>
  );
};
