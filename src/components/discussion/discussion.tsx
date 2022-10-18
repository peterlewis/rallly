import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { useDayjs } from "../../utils/dayjs";
import { requiredString } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import CompactButton from "../compact-button";
import Dropdown, { DropdownItem } from "../dropdown";
import Chat from "../icons/chat.svg";
import DotsHorizontal from "../icons/dots-horizontal.svg";
import Plus from "../icons/plus.svg";
import Trash from "../icons/trash.svg";
import { NameInput } from "../name-input";
import TruncatedLinkify from "../poll/truncated-linkify";
import UserAvatar from "../poll/user-avatar";
import { usePoll } from "../poll-provider";
import { useUser } from "../user-provider";

interface CommentForm {
  authorName: string;
  content: string;
}

const Discussion: React.VoidFunctionComponent = () => {
  const { dayjs } = useDayjs();
  const queryClient = trpc.useContext();
  const { t } = useTranslation("app");
  const { poll } = usePoll();

  const pollId = poll.id;

  const { data: comments } = trpc.useQuery(
    ["polls.comments.list", { pollId }],
    {
      refetchInterval: 10000, // refetch every 10 seconds
    },
  );

  const { user } = useUser();
  const plausible = usePlausible();

  const addComment = trpc.useMutation("polls.comments.add", {
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ["polls.comments.list", { pollId }],
        (existingComments = []) => {
          return [...existingComments, newComment];
        },
      );
      plausible("Created comment");
    },
  });

  const deleteComment = trpc.useMutation("polls.comments.delete", {
    onMutate: ({ commentId }) => {
      queryClient.setQueryData(
        ["polls.comments.list", { pollId }],
        (existingComments = []) => {
          return [...existingComments].filter(({ id }) => id !== commentId);
        },
      );
    },
    onSuccess: () => {
      plausible("Deleted comment");
    },
  });

  const { register, reset, control, handleSubmit, formState } =
    useForm<CommentForm>({
      defaultValues: {
        authorName: "",
        content: "",
      },
    });

  if (!comments) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between border-slate-300/75 py-3 font-medium text-slate-500">
        <div className="inline-flex items-center gap-2">
          <Chat className="h-5" />
          {t("comments", { count: comments.length })}
        </div>
        <Button icon={<Plus />} type="ghost">
          {t("leaveAComment")}
        </Button>
      </div>
      {comments.length ? (
        <div className="mb-4 space-y-4 rounded-md bg-gray-100 p-4">
          {comments.map((comment) => {
            const canDelete =
              poll.admin || !comment.userId || comment.userId === user.id;

            return (
              <div className="flex" key={comment.id}>
                <div data-testid="comment" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserAvatar
                      name={comment.authorName}
                      showName={true}
                      isYou={user.id === comment.userId}
                    />
                    <div className="mb-1">
                      <span className="mr-1 text-slate-400">&bull;</span>
                      <span className="text-sm text-slate-500">
                        {dayjs(new Date(comment.createdAt)).fromNow()}
                      </span>
                    </div>
                    <Dropdown
                      placement="bottom-start"
                      trigger={<CompactButton icon={DotsHorizontal} />}
                    >
                      <DropdownItem
                        icon={Trash}
                        label={t("deleteComment")}
                        disabled={!canDelete}
                        onClick={() => {
                          deleteComment.mutate({
                            commentId: comment.id,
                            pollId,
                          });
                        }}
                      />
                    </Dropdown>
                  </div>
                  <div className=" w-fit whitespace-pre-wrap rounded-xl bg-white px-3 py-2">
                    <TruncatedLinkify>{comment.content}</TruncatedLinkify>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {/* <form
        onSubmit={handleSubmit(async ({ authorName, content }) => {
          await addComment.mutateAsync({ authorName, content, pollId });
          reset({ authorName, content: "" });
        })}
        className="relative rounded-md border bg-white p-4 shadow-sm"
      >
        <textarea
          id="comment"
          rows={2}
          placeholder={t("commentPlaceholder")}
          className="w-full scroll-pb-16 rounded-md border border-gray-200 p-3 pb-16 shadow-sm placeholder:text-slate-500/75 focus:ring-indigo-500"
          {...register("content", { validate: requiredString })}
        />
        <div className="bottom- absolute left-3 flex w-full">
          <Button
            htmlType="submit"
            type="primary"
            loading={formState.isSubmitting}
          >
            {t("comment")}
          </Button>
        </div>
      </form> */}
    </div>
  );
};

export default React.memo(Discussion);
