import { trpc } from "../utils/trpc";
import { usePoll } from "./poll-context";

export const usePollMutations = () => {
  const queryClient = trpc.useContext();
  const { poll } = usePoll();

  const updatePoll = trpc.useMutation("polls.update", {
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["polls.get", { urlId: data.id, admin: poll.admin }],
        data,
      );
    },
  });
  return { updatePoll };
};
