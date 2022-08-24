import { Trans, useTranslation } from "next-i18next";
import * as React from "react";

import { Button } from "@/components/button";
import Bell from "@/components/icons/bell.svg";
import BellCrossed from "@/components/icons/bell-crossed.svg";

import { useLoginModal } from "../auth/login-modal";
import { usePoll } from "../poll-provider";
import Tooltip from "../tooltip";
import { usePollMutations } from "../use-poll-mutations";
import { useUser } from "../user-provider";

const NotificationsToggle: React.VoidFunctionComponent = () => {
  const { poll, urlId } = usePoll();
  const { t } = useTranslation("app");
  React.useState(false);

  const { user } = useUser();
  const { updatePoll } = usePollMutations();
  const { openLoginModal } = useLoginModal();
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
        loading={updatePoll.isLoading}
        icon={poll.notifications ? <Bell /> : <BellCrossed />}
        onClick={async (e) => {
          if (poll.user?.id === user.id && !user.isGuest) {
            await updatePoll.mutateAsync({
              urlId,
              notifications: !poll.notifications,
            });
          } else {
            openLoginModal();
          }
        }}
      />
    </Tooltip>
  );
};

export default NotificationsToggle;
