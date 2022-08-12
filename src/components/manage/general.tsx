import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { requiredString } from "../../utils/form-validation";
import { Button } from "../button";
import { useModalContext } from "../modal/modal-provider";
import { DeletePollForm } from "../poll/manage-poll/delete-poll-form";
import { useCsvExporter } from "../poll/manage-poll/use-csv-exporter";
import { usePoll } from "../poll-provider";
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

  const { updatePoll } = usePollMutations();
  const { exportToCsv } = useCsvExporter();
  const modalContext = useModalContext();
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="font-semibold leading-snug">{t("Details")}</div>
        <div className="text-gray-500">{t("Update details of your poll")}</div>
      </div>
      <form
        onSubmit={handleSubmit(async (data) => {
          await updatePoll.mutateAsync({
            urlId: poll.adminUrlId,
            title: data.title,
            location: data.location,
            description: data.description,
          });
        })}
        className="divide-y"
      >
        <fieldset className="flex space-x-4 py-4">
          <label className="w-48 font-semibold">{t("title")}</label>
          <div className="grow">
            <TextInput
              className="w-full"
              placeholder={t("titlePlaceholder")}
              {...register("title", {
                validate: requiredString,
              })}
            />
          </div>
        </fieldset>
        <fieldset className="flex space-x-4 py-4">
          <label className="w-48 font-semibold">{t("location")}</label>
          <div className="grow">
            <TextInput
              className="w-full"
              placeholder={t("locationPlaceholder")}
              {...register("location")}
            />
          </div>
        </fieldset>
        <fieldset className="flex space-x-4 py-4">
          <label className="w-48 font-semibold">{t("description")}</label>
          <div className="grow">
            <textarea
              id="description"
              className="input w-full"
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              {...register("description")}
            />
          </div>
        </fieldset>

        <div className="flex py-4">
          <Button
            loading={formState.isSubmitting}
            htmlType="submit"
            type="primary"
          >
            {t("save")}
          </Button>
        </div>
      </form>
      <div className="card divide-y p-0">
        <div className="flex justify-between p-4">
          <div>
            <div className="font-semibold leading-snug">{t("Export")}</div>
            <div className="text-gray-500">
              {t("Export your results to CSV format")}
            </div>
          </div>
          <Button onClick={exportToCsv}>{t("exportToCsv")}</Button>
        </div>
        <div className="flex justify-between p-4">
          <div>
            <div className="font-semibold leading-snug">{t("deletePoll")}</div>
            <div className="text-gray-500">
              {t("Once a poll is deleted it cannot be recovered")}
            </div>
          </div>
          <Button
            type="danger"
            onClick={() => {
              modalContext.render({
                overlayClosable: true,
                content: function Content({ close }) {
                  return (
                    <DeletePollForm
                      onCancel={close}
                      onConfirm={close}
                      urlId={poll.adminUrlId}
                    />
                  );
                },
                footer: null,
              });
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  );
};
