import { useTranslation } from "next-i18next";
import * as React from "react";
import { useForm } from "react-hook-form";

import { TextInput } from "@/components/text-input";
import { requiredString } from "@/utils/form-validation";

export type PollDetailsForm = {
  title: string;
  location: string;
  description: string;
};

export const PollDetailsStep: React.VoidFunctionComponent<{
  defaultValues?: PollDetailsForm;
  onSubmit: (values: PollDetailsForm) => void;
  formId?: string;
}> = ({ defaultValues, onSubmit, formId }) => {
  const { register, handleSubmit } = useForm<PollDetailsForm>({
    defaultValues,
  });
  const { t } = useTranslation("app");

  return (
    <div>
      <form
        id={formId}
        onSubmit={handleSubmit((data) => {
          onSubmit(data);
        })}
      >
        <div className="max-w-lg space-y-4">
          <fieldset>
            <label className="mb-2 font-medium">{t("title")}</label>
            <TextInput
              className="w-full"
              placeholder={t("titlePlaceholder")}
              {...register("title", { validate: requiredString })}
            />
          </fieldset>
          <fieldset>
            <label className="mb-2 font-medium">{t("location")}</label>
            <TextInput
              className="w-full"
              placeholder="123 Brick Lane"
              {...register("location")}
            />
          </fieldset>
          <fieldset>
            <label className="mb-2 font-medium">{t("description")}</label>
            <textarea
              className="input w-full"
              rows={5}
              placeholder={t("descriptionPlaceholder")}
              {...register("description")}
            />
          </fieldset>
        </div>
      </form>
    </div>
  );
};
