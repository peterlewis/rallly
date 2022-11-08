import clsx from "clsx";
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
  const { register, handleSubmit, formState } = useForm<{
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
    >
      <div className="mb-4 space-y-4">
        <div className="formField">
          <label htmlFor="title">{t("title")}</label>
          <input
            type="text"
            id="title"
            className={clsx("input w-full", {
              // "input-error": errors.title,
            })}
            placeholder={t("titlePlaceholder")}
            {...register("title", { validate: requiredString(t("title")) })}
          />
        </div>
        <div className="formField">
          <label htmlFor="location">{t("location")}</label>
          <input
            type="text"
            id="location"
            className="input w-full"
            placeholder={t("locationPlaceholder")}
            {...register("location")}
          />
        </div>
        <div className="formField">
          <label htmlFor="description">{t("description")}</label>
          <textarea
            id="description"
            className="input w-full"
            placeholder={t("descriptionPlaceholder")}
            rows={5}
            {...register("description")}
          />
        </div>
      </div>
      <div className="flex space-x-3">
        <Button
          type="primary"
          loading={formState.isSubmitting}
          htmlType="submit"
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
};
