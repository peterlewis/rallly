import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { Button } from "../../button";
import { TextInput } from "../../text-input";

type ParticipantDetailsForm = {
  name: string;
  email: string;
};

export const ParticipantDetailsForm: React.VoidFunctionComponent<{
  onSubmit: (data: ParticipantDetailsForm) => Promise<void>;
}> = ({ onSubmit }) => {
  const { register, handleSubmit, formState } =
    useForm<ParticipantDetailsForm>();
  const { t } = useTranslation("app");
  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-xl font-semibold">Enter your details</div>
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
        <TextInput {...register("email")} placeholder={t("emailPlaceholder")} />
      </fieldset>
      <Button loading={formState.isSubmitting} htmlType="submit" type="primary">
        {t("submit")}
      </Button>
    </form>
  );
};
