import { Trans, useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import * as React from "react";

import { Button } from "@/components/button";
import Bell from "@/components/icons/bell.svg";
import BellCrossed from "@/components/icons/bell-crossed.svg";

import { usePoll } from "../poll-context";
import Tooltip from "../tooltip";
import { useUser } from "../user-provider";
import { useUpdatePollMutation } from "./mutations";

const NotificationsToggle: React.VoidFunctionComponent = () => {
  const { poll, urlId } = usePoll();
  const { t } = useTranslation("app");
  const [isUpdatingNotifications, setIsUpdatingNotifications] =
    React.useState(false);

  const { user } = useUser();
  const { mutate: updatePollMutation } = useUpdatePollMutation();

  const plausible = usePlausible();
  return (
    <Tooltip
      content={
        poll.user ? (
          poll.notifications ? (
            <div>
              <div className="font-medium text-primary-300">
                {t("notificationsOn")}
              </div>
              <div className="max-w-sm">
                <Trans
                  t={t}
                  i18nKey="notificationsOnDescription"
                  values={{
                    email: poll.user.email,
                  }}
                  components={{
                    b: (
                      <span className="whitespace-nowrap font-mono font-medium text-primary-300 " />
                    ),
                  }}
                />
              </div>
            </div>
          ) : (
            t("notificationsOff")
          )
        ) : (
          t("notificationsLoginRequired")
        )
      }
    >
      <Button
        loading={isUpdatingNotifications}
        icon={poll.notifications ? <Bell /> : <BellCrossed />}
        disabled={!poll.user || poll.user.id !== user.id}
        onClick={() => {
          setIsUpdatingNotifications(true);
          updatePollMutation(
            {
              urlId,
              notifications: !poll.notifications,
            },
            {
              onSuccess: ({ notifications }) => {
                plausible(
                  notifications
                    ? "Turned notifications on"
                    : "Turned notifications off",
                );
                setIsUpdatingNotifications(false);
              },
            },
          );
        }}
      />
    </Tooltip>
  );
};

export default NotificationsToggle;
