import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";

import { useFormValidation } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import { createModalHook } from "../modal/modal-provider";
import { usePoll } from "../poll-provider";

export const Composer: React.VoidFunctionComponent<{ onDone: () => void }> = ({
  onDone,
}) => {
  const { poll } = usePoll();
  const pollId = poll.id;

  const queryClient = trpc.useContext();
  const addComment = trpc.useMutation("polls.comments.add", {
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ["polls.comments.list", { pollId }],
        (existingComments = []) => {
          return [...existingComments, newComment];
        },
      );
      queryClient.invalidateQueries(["polls.comments.list", { pollId }]);
    },
  });

  const { requiredString } = useFormValidation();

  const { register, trigger, handleSubmit, formState } = useForm<{
    content: string;
  }>({
    defaultValues: { content: "" },
    reValidateMode: "onChange",
  });

  const submit = handleSubmit(async ({ content }) => {
    // create comment
    await addComment.mutateAsync({ pollId, content });
    onDone();
  });

  const { t } = useTranslation("app");
  return (
    <div className="flex items-start gap-4">
      <div>
        <div className="inline-block h-12 w-12 rounded-full bg-slate-100" />
      </div>
      <form className="grow space-y-2" onSubmit={submit}>
        <TextareaAutosize
          data-autoFocus={true}
          readOnly={formState.isSubmitting}
          minRows={4}
          rows={4}
          maxRows={12}
          onKeyPress={(e) => {
            if (e.code === "Enter" && !e.shiftKey) {
              submit();
              e.preventDefault();
            }
          }}
          placeholder={t("commentPlaceholder")}
          className="w-full resize-none rounded border-0 text-xl placeholder:text-slate-400 focus:ring-0"
          {...register("content", {
            validate: requiredString("content"),
            onChange: () => trigger("content"),
          })}
        />
        <div className="action-group justify-end">
          <Button onClick={onDone}>{t("cancel")}</Button>
          <Button
            htmlType="submit"
            disabled={!formState.isValid}
            loading={formState.isSubmitting}
            type="primary"
          >
            {t("comment")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const useComposer = createModalHook("composer", Composer);
