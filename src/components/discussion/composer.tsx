import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import { useFormValidation } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import { ModalProps } from "../modal/modal";
import { useModalContext } from "../modal/modal-provider";
import { useParticipants } from "../participants-provider";
import { usePoll } from "../poll-provider";
import { useUser } from "../user-provider";

type Props = Record<string, unknown>;

const createModalHook = <P extends Props>(
  id: string,
  Component: React.ComponentType<P>,
  modalProps: ModalProps,
) => {
  const useModalHook = () => {
    const modalContext = useModalContext();

    return {
      show: (props: P) => {
        modalContext.add(id, {
          content: (
            <div className="p-4">
              <Component {...props} />
            </div>
          ),
          footer: null,
          ...modalProps,
        });
      },
      close: () => {
        modalContext.remove(id);
      },
    };
  };

  return useModalHook;
};

export const Composer: React.VoidFunctionComponent<{ onHide?: () => void }> = ({
  onHide,
}) => {
  const { poll } = usePoll();
  const pollId = poll.id;

  const { user } = useUser();
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
    onHide?.();
  });

  const { t } = useTranslation("app");
  return (
    <div className="flex items-start gap-4">
      <div>
        <div className="inline-block h-12 w-12 rounded-full bg-slate-100" />
      </div>
      <form className="grow space-y-2" onSubmit={submit}>
        <textarea
          readOnly={formState.isSubmitting}
          rows={3}
          onKeyPress={(e) => {
            if (e.code === "Enter" && !e.shiftKey) {
              submit();
              e.preventDefault();
            }
          }}
          placeholder={t("commentPlaceholder")}
          className="w-full rounded border-0 text-xl placeholder:text-slate-400 focus:ring-0"
          {...register("content", {
            validate: requiredString("content"),
            onChange: () => trigger("content"),
          })}
        />
        <div className="action-group justify-end">
          <Button onClick={onHide}>{t("cancel")}</Button>
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

export const useComposer = createModalHook("composer", Composer, {
  showClose: true,
});
