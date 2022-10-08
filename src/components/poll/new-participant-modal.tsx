import { VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { useMount } from "react-use";

import Check from "@/components/icons/check.svg";

import { useFormValidation } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import { useModalContext } from "../modal/modal-provider";
import { TextInput } from "../text-input";
import { PollValue, PollViewOption } from "./types";
import VoteIcon from "./vote-icon";

export const NewParticipantModal: React.VoidFunctionComponent<{
  onCancel?: () => void;
  onSubmit?: (data: {
    name: string;
    votes: Record<string, VoteType | undefined>;
  }) => Promise<void>;
  votes: Record<string, VoteType | undefined>;
  options: PollViewOption[];
}> = ({ onCancel, onSubmit, options, votes }) => {
  const { t } = useTranslation("app");

  const { requiredString } = useFormValidation();
  const { register, handleSubmit, setFocus, formState } = useForm<{
    name: string;
  }>({
    defaultValues: { name: "" },
  });

  useMount(() => {
    setFocus("name");
  });

  if (formState.isSubmitSuccessful) {
    return (
      <div className="p-6">
        <div className="mb-8 w-full space-y-4 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-400">
            <Check className="h-10 text-white" />
          </div>
          <div className="">
            <div className="mb-1 text-xl font-medium text-slate-700">
              Thank you
            </div>
            <div className="text-lg leading-snug text-slate-400">
              Your submission has been added
            </div>
          </div>
        </div>
        <Button type="primary" className="w-full" onClick={onCancel}>
          {t("continue")}
        </Button>
      </div>
    );
  }
  return (
    <div className="w-[390px] max-w-full space-y-8 p-4">
      <form
        onSubmit={handleSubmit(async ({ name }) => {
          await onSubmit?.({ name, votes });
        })}
      >
        <div className="-mt-1 mb-4">
          <div className="text-lg font-semibold">New submission</div>
        </div>
        <div className="space-y-4">
          <fieldset>
            <div className="mb-1 text-sm font-semibold">Name</div>
            <div>
              <TextInput
                size="lg"
                className="max-w-full"
                placeholder={t("namePlaceholder")}
                autoFocus={true}
                {...register("name", {
                  validate: requiredString(t("name")),
                })}
              />
            </div>
          </fieldset>
          <div>
            <div className="mb-2 text-sm font-semibold">Votes</div>
            <div className="space-y-2 overflow-auto rounded border p-4">
              {options.map((option) => {
                const vote = votes[option.id];
                if (vote && vote !== "no") {
                  return (
                    <div className="flex items-center space-x-3">
                      <VoteIcon type={vote} />
                      <div>{option.i18nDate}</div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              loading={formState.isSubmitting}
              htmlType="submit"
              type="primary"
            >
              {t("submit")}
            </Button>
            <Button onClick={onCancel}>{t("cancel")}</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const useNewParticipantModal = (id: string) => {
  const modalContext = useModalContext();
  const openNewParticipantModal = (
    votes: PollValue,
    options: PollViewOption[],
  ) => {
    const queryClient = trpc.useContext();
    const addParticipant = trpc.useMutation("polls.participants.add", {
      onSuccess: (newParticipant) => {
        queryClient.setQueryData(
          ["polls.participants.list", { pollId: id }],
          (participants = []) => {
            return [...participants, newParticipant];
          },
        );
      },
    });

    modalContext.render({
      footer: null,
      content: function NewParticipantModalContent({ close }) {
        return (
          <NewParticipantModal
            votes={votes}
            options={options}
            onCancel={close}
            onSubmit={async ({ name, votes }) => {
              await addParticipant.mutateAsync({
                pollId: id,
                votes: options.map((option) => ({
                  optionId: option.id,
                  type: votes[option.id] ?? "no",
                })),
                name,
              });
            }}
          />
        );
      },
    });
  };

  return { openNewParticipantModal };
};
