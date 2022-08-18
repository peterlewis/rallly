import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import toast from "react-hot-toast";
import { useWindowSize } from "react-use";

import { Button } from "@/components/button";
import Discussion from "@/components/discussion";
import LockClosed from "@/components/icons/lock-closed.svg";
import Share from "@/components/icons/share.svg";
import { preventWidows } from "@/utils/prevent-widows";

import { AppLayout, AppLayoutHeading } from "./app-layout";
import { useParticipants } from "./participants-provider";
import { useUpdatePollMutation } from "./poll/mutations";
import NotificationsToggle from "./poll/notifications-toggle";
import { PollDataProvider } from "./poll/poll-data-provider";
import PollSubheader from "./poll/poll-subheader";
import TruncatedLinkify from "./poll/truncated-linkify";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";
import { usePoll } from "./poll-provider";
import Sharing from "./sharing";
import TimeZonePicker from "./time-zone-picker";
import { useTimeZones } from "./time-zone-picker/time-zone-picker";

const TimeZone = () => {
  const { t } = useTranslation("app");
  const { findFuzzyTz } = useTimeZones();
  const { targetTimeZone, setTargetTimeZone } = usePoll();

  const [isEditing, setEditing] = React.useState(false);
  if (isEditing) {
    return (
      <div className="mt-1 flex space-x-3">
        <TimeZonePicker
          className="w-96"
          value={targetTimeZone}
          onChange={setTargetTimeZone}
        />
        <Button onClick={() => setEditing(false)}>Done</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="truncate">{findFuzzyTz(targetTimeZone).label}</span>
      <Button className="ml-3" onClick={() => setEditing(true)}>
        {t("change")}
      </Button>
    </div>
  );
};

const PollPage: NextPage = () => {
  const { poll, urlId, targetTimeZone } = usePoll();
  const { participants } = useParticipants();
  const router = useRouter();
  const { width: windowWidth } = useWindowSize();
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

  const names = React.useMemo(
    () => participants?.map(({ name }) => name) ?? [],
    [participants],
  );

  const [isSharingVisible, setSharingVisible] = React.useState(
    !!router.query.sharing,
  );

  return (
    <AppLayout
      breadcrumbs={[{ title: <>&larr; {t("meetingPolls")}</>, href: "/polls" }]}
      title={poll.title}
    >
      <UserAvatarProvider seed={poll.id} names={names}>
        <Head>
          <title>{poll.title}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="max-w-full">
          <LayoutGroup>
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
              <div className="flex bg-sky-100 py-3 px-4 text-sky-700 md:mb-4 md:rounded-lg md:shadow-sm">
                <div className="mr-2 rounded-md">
                  <LockClosed className="w-6" />
                </div>
                <div>
                  <div className="font-medium">{t("pollHasBeenLocked")}</div>
                </div>
              </div>
            ) : null}
            <motion.div layout="position" initial={false} className="space-y-8">
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
              <div className="space-y-4 px-4 sm:px-0">
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
                {poll.timeZone ? (
                  <div className="lg:text-lg">
                    <div className="text-sm text-slate-500">
                      {t("timesShown")}
                    </div>
                    <div>
                      <TimeZone />
                    </div>
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
              {participants ? (
                <div className="py-8">
                  <div
                    className="line-pattern absolute -left-full -z-10 hidden -translate-y-8 sm:block"
                    style={{
                      width: windowWidth * 2,
                      height: 250 + 57 * participants.length,
                    }}
                  />
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
