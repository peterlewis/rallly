import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/button";
import Discussion from "@/components/discussion";
import LockClosed from "@/components/icons/lock-closed.svg";
import Share from "@/components/icons/share.svg";
import { preventWidows } from "@/utils/prevent-widows";

import { useParticipants } from "./participants-provider";
import ManagePoll from "./poll/manage-poll";
import { useUpdatePollMutation } from "./poll/mutations";
import NotificationsToggle from "./poll/notifications-toggle";
import { PollDataProvider } from "./poll/poll-data-provider";
import PollSubheader from "./poll/poll-subheader";
import TruncatedLinkify from "./poll/truncated-linkify";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";
import { usePoll } from "./poll-context";
import Sharing from "./sharing";
import { useUser } from "./user-provider";

const PollPage: NextPage = () => {
  const { poll, urlId, admin, targetTimeZone } = usePoll();
  const { participants } = useParticipants();
  const router = useRouter();

  const { user } = useUser();
  useTouchBeacon(poll.id);

  const { t } = useTranslation("app");

  const plausible = usePlausible();

  const { mutate: updatePollMutation } = useUpdatePollMutation();

  React.useEffect(() => {
    if (router.query.unsubscribe) {
      updatePollMutation(
        { urlId: urlId, notifications: false },
        {
          onSuccess: () => {
            toast.success(t("notificationsDisabled"));
            plausible("Unsubscribed from notifications");
          },
        },
      );
      router.replace(`/admin/${router.query.urlId}`, undefined, {
        shallow: true,
      });
    }
  }, [plausible, urlId, router, updatePollMutation, t]);

  const checkIfWideScreen = () => window.innerWidth > 640;

  const [isWideScreen, setIsWideScreen] = React.useState(checkIfWideScreen);

  React.useEffect(() => {
    const listener = () => setIsWideScreen(checkIfWideScreen());

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    };
  }, []);

  const names = React.useMemo(
    () => participants?.map(({ name }) => name) ?? [],
    [participants],
  );

  const [isSharingVisible, setSharingVisible] = React.useState(
    !!router.query.sharing,
  );

  return (
    <UserAvatarProvider seed={poll.id} names={names}>
      <Head>
        <title>{poll.title}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="relative max-w-full overflow-hidden lg:mt-8">
        <LayoutGroup>
          {admin ? (
            <>
              <div className="mb-4 flex space-x-2 lg:px-4">
                <NotificationsToggle />
                <ManagePoll
                  placement={isWideScreen ? "bottom-end" : "bottom-start"}
                />
                <Button
                  type="primary"
                  icon={<Share />}
                  onClick={() => {
                    setSharingVisible((value) => !value);
                  }}
                >
                  {t("share")}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {isSharingVisible ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    className="mb-4 overflow-hidden"
                  >
                    <Sharing
                      onHide={() => {
                        setSharingVisible(false);
                      }}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          ) : null}
          {!poll.admin && poll.adminUrlId ? (
            <div className="mb-4 items-center justify-between rounded-lg px-4 md:flex md:space-x-4 md:border md:p-2 md:pl-4">
              <div className="mb-4 font-medium md:mb-0">
                {t("pollOwnerNotice", {
                  name: poll.user ? poll.user.name : "Guest",
                })}
              </div>
              <a href={`/admin/${poll.adminUrlId}`} className="btn-default">
                {t("goToAdmin")} &rarr;
              </a>
            </div>
          ) : null}
          {poll.closed ? (
            <div className="flex bg-sky-100 py-3 px-4 text-sky-700 md:mb-4 md:rounded-lg md:shadow-sm">
              <div className="mr-2 rounded-md">
                <LockClosed className="w-6" />
              </div>
              <div>
                <div className="font-medium">{t("pollHasBeenLocked")}</div>
              </div>
            </div>
          ) : null}
          <motion.div layout="position" className="space-y-8">
            <div>
              <div className="space-y-4 lg:px-4">
                <div>
                  <div
                    className="mb-1 text-2xl font-semibold text-slate-700 md:text-left md:text-3xl"
                    data-testid="poll-title"
                  >
                    {preventWidows(poll.title)}
                  </div>
                  <PollSubheader />
                </div>
                {poll.description ? (
                  <div className="border-primary whitespace-pre-line lg:text-lg">
                    <TruncatedLinkify>
                      {preventWidows(poll.description)}
                    </TruncatedLinkify>
                  </div>
                ) : null}
                {poll.location ? (
                  <div className="lg:text-lg">
                    <div className="text-sm text-slate-500">
                      {t("location")}
                    </div>
                    <TruncatedLinkify>{poll.location}</TruncatedLinkify>
                  </div>
                ) : null}
                <div>
                  <div className="mb-2 text-sm text-slate-500">
                    {t("possibleAnswers")}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center space-x-1">
                      <VoteIcon type="yes" />
                      <span className="text-xs text-slate-500">{t("yes")}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <VoteIcon type="ifNeedBe" />
                      <span className="text-xs text-slate-500">
                        {t("ifNeedBe")}
                      </span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <VoteIcon type="no" />
                      <span className="text-xs text-slate-500">{t("no")}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {participants ? (
              <PollDataProvider
                admin={poll.admin}
                options={poll.options.map(({ id, value }) => ({
                  id,
                  value:
                    value.indexOf("/") === -1
                      ? { type: "date", date: value }
                      : {
                          type: "time",
                          start: value.split("/")[0],
                          end: value.split("/")[1],
                        },
                }))}
                targetTimeZone={targetTimeZone}
                pollId={poll.id}
                userId={user.id}
                timeZone={poll.timeZone}
                participants={participants}
              />
            ) : null}
            <Discussion />
          </motion.div>
        </LayoutGroup>
      </div>
    </UserAvatarProvider>
  );
};

export default PollPage;
