import { useTranslation } from "next-i18next";
import React from "react";
import toast from "react-hot-toast";

import Bell from "@/components/icons/bell.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import Save from "@/components/icons/save.svg";
import Trash from "@/components/icons/trash.svg";

import { Button } from "../button";
import { useModalContext } from "../modal/modal-provider";
import { DeletePollForm } from "../poll/manage-poll/delete-poll-form";
import { useCsvExporter } from "../poll/manage-poll/use-csv-exporter";
import { usePoll } from "../poll-provider";
import Switch from "../switch";
import { usePollMutations } from "../use-poll-mutations";
import { useUser } from "../user-provider";

const AdvancedOption: React.VoidFunctionComponent<{
  title: React.ReactNode;
  description: React.ReactNode;
  action: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ title, description, action, icon: Icon }) => {
  return (
    <div className="justify-between p-4 sm:flex sm:space-x-4">
      <div className="mb-4 flex flex-row-reverse sm:mb-0 sm:flex-row">
        <div className="ml-4 sm:mr-4 sm:ml-0">
          {Icon ? <Icon className="h-6 text-primary-500" /> : null}
        </div>
        <div>
          <div className="font-semibold leading-snug">{title}</div>
          <div className="text-slate-500">{description}</div>
        </div>
      </div>
      {action}
    </div>
  );
};

export const Advanced = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  const { exportToCsv } = useCsvExporter();
  const modalContext = useModalContext();

  const { user } = useUser();
  const { updatePoll } = usePollMutations();

  const [locked, setLocked] = React.useState(poll.closed);
  const [notifications, setNotifications] = React.useState(poll.notifications);

  return (
    <div className="divide-y rounded-lg border p-0">
      <AdvancedOption
        icon={Bell}
        title={t("notifications")}
        description={t("notificationsDescription")}
        action={
          <Switch
            disabled={!poll.user || user.id !== poll.user.id}
            checked={notifications}
            onChange={(newValue) => {
              setNotifications(newValue);
              toast.promise(
                updatePoll.mutateAsync({
                  urlId: poll.adminUrlId,
                  notifications: newValue,
                }),
                {
                  loading: t("saving"),
                  success: t("saved"),
                  error: t("saveFailed"),
                },
              );
            }}
          />
        }
      />
      <AdvancedOption
        icon={LockClosed}
        title={t("lockPoll")}
        description={t("lockPollDescription")}
        action={
          <Switch
            checked={locked}
            onChange={(newValue) => {
              setLocked(newValue);
              toast.promise(
                updatePoll.mutateAsync({
                  urlId: poll.adminUrlId,
                  closed: newValue,
                }),
                {
                  loading: t("saving"),
                  success: t("saved"),
                  error: t("saveFailed"),
                },
              );
            }}
          />
        }
      />
      <AdvancedOption
        icon={Save}
        title={t("exportResults")}
        description={t("exportResultsDescription")}
        action={<Button onClick={exportToCsv}>{t("exportToCsv")}</Button>}
      />
      <AdvancedOption
        icon={Trash}
        title={t("deletePoll")}
        description={t("deletePollHint")}
        action={
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
        }
      />
    </div>
  );
};
