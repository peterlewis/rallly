import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { useMount } from "react-use";

import { Button } from "../button";
import { TextInput } from "../text-input";

export const ChangeNameModal: React.VoidFunctionComponent<{
  currentName: string;
  onSubmit: (newName: string) => Promise<void>;
  onCancel: () => void;
}> = ({ onSubmit, onCancel, currentName }) => {
  const { t } = useTranslation("app");

  const { register, handleSubmit, setFocus, formState } = useForm<{
    name: string;
  }>({
    defaultValues: {
      name: currentName,
    },
  });

  useMount(() => {
    setFocus("name");
  });

  return (
    <div className="w-[360px] p-4">
      <div className="mb-4">
        <div className="text-lg font-semibold">{t("Rename participant")}</div>
        <div className="text-slate-500">
          {t("Type in the new name for this participant")}
        </div>
      </div>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async ({ name }) => {
          await onSubmit(name);
        })}
      >
        <TextInput
          placeholder={t("namePlaceholder")}
          className="w-full"
          {...register("name")}
        />
        <div className="flex space-x-3">
          <Button
            htmlType="submit"
            loading={formState.isSubmitting}
            type="primary"
          >
            {t("Rename")}
          </Button>
        </div>
      </form>
    </div>
  );
};
