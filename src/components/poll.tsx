import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/button";
import Discussion from "@/components/discussion";
import InformationCircle from "@/components/icons/information-circle.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import Share from "@/components/icons/share.svg";
import { preventWidows } from "@/utils/prevent-widows";

import { trpc } from "../utils/trpc";
import { AppLayout, AppLayoutHeading } from "./app-layout";
import { useLoginModal } from "./auth/login-modal";
import { LinkText } from "./LinkText";
import { useParticipants } from "./participants-provider";
import NotificationsToggle from "./poll/notifications-toggle";
import { PollDataProvider } from "./poll/poll-data-provider";
import PollSubheader from "./poll/poll-subheader";
import TruncatedLinkify from "./poll/truncated-linkify";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";
import { usePoll } from "./poll-provider";
import Sharing from "./sharing";
import { usePollMutations } from "./use-poll-mutations";
import { useUser } from "./user-provider";

const Legend = () => {
  const { t } = useTranslation("app");
  return (
    <div className="flex h-8 items-center space-x-3">
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="yes" />
        <span className="text-xs text-slate-500">{t("yes")}</span>
      </span>
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="ifNeedBe" />
        <span className="text-xs text-slate-500">{t("ifNeedBe")}</span>
      </span>
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="no" />
        <span className="text-xs text-slate-500">{t("no")}</span>
      </span>
    </div>
  );
};

const UnclaimedPollAlert = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  const { user } = useUser();
  const { openLoginModal } = useLoginModal();
  const context = trpc.useContext();
  const claimPoll = trpc.useMutation("polls.claim", {
    onSuccess: (res) => {
      context.setQueryData(
        ["polls.get", { urlId: poll.adminUrlId, admin: true }],
        res,
      );
    },
  });

  if (poll.user) {
    return null;
  }

  if (user.isGuest) {
    return (
      <div className="break-container flex bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:rounded-lg">
        <div className="mr-2">
          <InformationCircle className="h-6" />
        </div>
        <div>
          <Trans
            t={t}
            i18nKey="guestPollNotice"
            components={{
              a: (
                <LinkText
                  onClick={(e) => {
                    e.preventDefault();
                    openLoginModal();
                  }}
                  className="text-blue-800/75 underline hover:text-blue-800 hover:underline"
                  href="/login"
                />
              ),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="items-center justify-between space-y-4 rounded-lg bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:flex sm:space-y-0 sm:space-x-4">
      <div className="flex">
        <div className="mr-2">
          <InformationCircle className="h-6" />
        </div>
        <div>
          <Trans t={t} i18nKey="unclaimedNoticeTitle" />
        </div>
      </div>
      <div>
        <button
          className="rounded-md bg-blue-700/5 py-2 px-4 font-medium leading-tight transition-colors hover:bg-blue-700/10 active:bg-blue-700/20"
          onClick={() => {
            claimPoll.mutateAsync({
              adminUrlId: poll.adminUrlId,
            });
          }}
        >
          {t("unclaimedNoticeAction")}
        </button>
      </div>
    </div>
  );
};

const PollPage: NextPage = () => {
  const { poll, urlId } = usePoll();
  const { participants } = useParticipants();
  const router = useRouter();

  useTouchBeacon(poll.id);

  const { t } = useTranslation("app");

  const plausible = usePlausible();

  const { updatePoll } = usePollMutations();

  React.useEffect(() => {
    if (router.query.unsubscribe) {
      updatePoll.mutate(
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
  }, [plausible, urlId, router, updatePoll, t]);

  const names = React.useMemo(
    () => participants?.map(({ name }) => name) ?? [],
    [participants],
  );

  const [isSharingVisible, setSharingVisible] = React.useState(
    !!router.query.sharing,
  );

  return (
    <AppLayout
      breadcrumbs={[
        { title: <>&larr; {t("groupMeetings")}</>, href: "/polls" },
      ]}
      title={poll.title}
    >
      <UserAvatarProvider seed={poll.id} names={names}>
        <Head>
          <title>{poll.title}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="max-w-full space-y-4">
          <LayoutGroup>
            <UnclaimedPollAlert />
            {poll.admin ? (
              <>
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
                        scale: 0.9,
                      }}
                    >
                      <Sharing
                        className="sm:mb-6"
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
              <div className="break-container flex bg-sky-100 py-3 px-4 text-sky-700 md:mb-4 md:rounded-lg md:shadow-sm">
                <div className="mr-2 rounded-md">
                  <LockClosed className="w-6" />
                </div>
                <div>
                  <div className="font-medium">{t("pollHasBeenLocked")}</div>
                </div>
              </div>
            ) : null}
            <motion.div
              layout="position"
              initial={false}
              className="space-y-4 sm:space-y-8"
            >
              <div className="space-y-4">
                <AppLayoutHeading
                  title={preventWidows(poll.title)}
                  description={<PollSubheader />}
                  actions={
                    poll.admin ? (
                      <div className="flex space-x-2">
                        <NotificationsToggle />
                        <Link href={`/admin/${poll.adminUrlId}/manage`}>
                          <a className="btn-default">{t("manage")}</a>
                        </Link>
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
                    ) : null
                  }
                />
                {poll.description ? (
                  <div className="border-primary whitespace-pre-line md:text-lg">
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
                <div className="lg:text-lg">
                  <div className="text-sm text-slate-500">
                    {t("possibleAnswers")}
                  </div>
                  <Legend />
                </div>
              </div>
              {participants ? (
                <div className="mobile:zero-padding sm:backdrop sm:bg-pattern sm:border-y sm:pt-4 sm:pb-4">
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
                    pollId={poll.id}
                    timeZone={poll.timeZone}
                    participants={participants}
                  />
                </div>
              ) : null}
              <Discussion />
            </motion.div>
          </LayoutGroup>
        </div>
      </UserAvatarProvider>
    </AppLayout>
  );
};

export default PollPage;
