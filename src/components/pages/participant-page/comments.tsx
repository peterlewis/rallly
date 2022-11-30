import { useTranslation } from "next-i18next";

import { useDayjs } from "../../../utils/dayjs";
import { trpcNext } from "../../../utils/trpc";
import { TextInput } from "../../text-input";
import { useParticipants, usePoll } from "./poll-context";

const useComments = () => {
  const { id } = usePoll();
  return trpcNext.comments.list.useQuery({ pollId: id });
};

const UserParticipant = (props: { userId: string | null }) => {
  const { participants } = usePoll();
  const userParticipant = participants.find(
    (participant) => participant.userId === props.userId,
  );

  const { t } = useTranslation("app");

  if (!userParticipant || props.userId === null) {
    return <div>{t("guest")}</div>;
  }

  return <div className="font-semibold">{userParticipant.name}</div>;
};

export const Comments = () => {
  const { data: comments } = useComments();
  const { dayjs } = useDayjs();
  if (!comments) {
    return <div>Loading…</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex grow flex-col justify-end space-y-4 p-4">
        {comments.map((comment) => {
          return (
            <div key={comment.id} className="rounded-md border bg-white p-3">
              <div className="action-group mb-1">
                <UserParticipant userId={comment.userId} />
                <div className="text-slate-700/50">
                  {dayjs(comment.createdAt).fromNow()}
                </div>
              </div>
              <div>{comment.content}</div>
            </div>
          );
        })}
      </div>
      <div className="p-4">
        <TextInput placeholder="Leave a comment" />
      </div>
    </div>
  );
};
