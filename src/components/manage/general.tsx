import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useFormValidation } from "../../utils/form-validation";
import { Button } from "../button";
import { usePoll } from "../poll-provider";
import { FormField } from "../settings";
import { TextInput } from "../text-input";
import { usePollMutations } from "../use-poll-mutations";

export const General: React.VFC = () => {
  const { poll } = usePoll();

  const { t } = useTranslation("app");
  const { register, handleSubmit, formState, reset } = useForm<{
    title: string;
    location: string;
    description: string;
  }>({
    defaultValues: {
      title: poll.title,
      location: poll.location ?? "",
      description: poll.description ?? "",
    },
  });

  const { requiredString } = useFormValidation();

  const { updatePoll } = usePollMutations();
  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await toast.promise(
          updatePoll.mutateAsync({
            urlId: poll.adminUrlId,
            title: data.title,
            location: data.location,
            description: data.description,
          }),
          {
            loading: t("saving"),
            success: t("saved"),
            error: t("saveFailed"),
          },
        );
      })}
      className="space-y-4"
    >
      <div className="divide-y rounded-lg border">
        <FormField name={t("title")}>
          <TextInput
            placeholder={t("titlePlaceholder")}
            {...register("title", {
              validate: requiredString(t("title")),
            })}
          />
        </FormField>
        <FormField name={t("location")}>
          <TextInput
            placeholder={t("locationPlaceholder")}
            {...register("location")}
          />
        </FormField>
        <FormField name={t("description")}>
          <textarea
            id="description"
            className="input w-full"
            placeholder={t("descriptionPlaceholder")}
            rows={5}
            {...register("description")}
          />
        </FormField>
      </div>
      <div className="flex space-x-3">
        <Button loading={formState.isSubmitting} htmlType="submit">
          {t("save")}
        </Button>
      </div>
    </form>
  );
};
