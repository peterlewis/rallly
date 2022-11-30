import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { Button } from "../../button";
import { TextInput } from "../../text-input";

export type ParticipantDetailsFormData = {
  name: string;
  email: string;
};

export const ParticipantDetailsForm = (props: {
  className?: string;
  defaultValues?: ParticipantDetailsFormData;
  onBack?: (data: ParticipantDetailsFormData) => void;
  onSubmit?: (data: ParticipantDetailsFormData) => Promise<void>;
}) => {
  const { register, getValues, handleSubmit, formState } =
    useForm<ParticipantDetailsFormData>({
      defaultValues: props.defaultValues,
    });
  const { t } = useTranslation("app");
  return (
    <form
      className={clsx("flex grow flex-col", props.className)}
      onSubmit={handleSubmit(async (data) => {
        await props.onSubmit?.(data);
      })}
    >
      <div className="grow space-y-3 p-4">
        <fieldset>
          <label className="mb-1 block px-1 text-sm text-slate-700/75">
            {t("name")}
          </label>
          <TextInput
            {...register("name")}
            autoFocus={true}
            placeholder={t("namePlaceholder")}
          />
        </fieldset>
        <fieldset>
          <label className="mb-1 block px-1 text-sm text-slate-700/75">
            {t("email")}
          </label>
          <TextInput
            {...register("email")}
            placeholder={t("emailPlaceholder")}
          />
        </fieldset>
      </div>
      <div className="action-group justify-between border-t px-4 py-3">
        <Button
          onClick={() => {
            props.onBack?.(getValues());
          }}
        >
          &larr; {t("back")}
        </Button>
        <Button
          loading={formState.isSubmitting}
          htmlType="submit"
          type="primary"
        >
          {t("submit")}
        </Button>
      </div>
    </form>
  );
};
