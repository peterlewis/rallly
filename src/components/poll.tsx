import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import toast from "react-hot-toast";
import { useCopyToClipboard } from "react-use";

import Discussion from "@/components/discussion";
import ClipboardCheck from "@/components/icons/clipboard-check.svg";
import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import Cog from "@/components/icons/cog.svg";
import Exclamation from "@/components/icons/exclamation.svg";
import Key from "@/components/icons/key.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import UserGroup from "@/components/icons/user-group.svg";
import { preventWidows } from "@/utils/prevent-widows";

import { AppLayout, AppLayoutHeading } from "./app-layout";
import { useLoginModal } from "./auth/login-modal";
import { LinkText } from "./link-text";
import { useParticipants } from "./participants-provider";
import NotificationsToggle from "./poll/notifications-toggle";
import { PollDataProvider } from "./poll/poll-data-provider";
import PollSubheader from "./poll/poll-subheader";
import TruncatedLinkify from "./poll/truncated-linkify";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";
import { usePoll } from "./poll-provider";
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

const ClipboardLink: React.VoidFunctionComponent<{
  className?: string;
  url: string;
  description: React.ReactNode;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, icon: Icon, url, description, className }) => {
  const { t } = useTranslation("app");
  const [state, copyToClipboard] = useCopyToClipboard();

  const [didCopy, setDidCopy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className={className}>
      <div className={clsx("mb-2 flex items-center space-x-2 text-sm ")}>
        <div className="flex">
          <Icon className="mr-2 h-5 text-primary-500" />
          <span className="font-semibold">{title}</span>
        </div>
        {state.error?.message ? (
          <span className="text-red-500">{state.error.message}</span>
        ) : null}
        <AnimatePresence>
          {didCopy ? (
            <motion.span
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-xs text-slate-400"
            >
              {t("copied")}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <div
        onClick={() => {
          inputRef.current?.select();
        }}
        className="mb-2 flex divide-x overflow-hidden rounded-md border bg-white"
      >
        <input
          ref={inputRef}
          readOnly={true}
          value={url}
          className={clsx(
            "grow py-2 pl-2 text-sm text-slate-700 transition-opacity sm:text-base",
            {
              "bg-slate-500/5": didCopy,
            },
          )}
        />
        <button
          onClick={() => {
            setDidCopy(true);
            copyToClipboard(url);
            setTimeout(() => {
              setDidCopy(false);
            }, 1000);
          }}
          type="button"
          className="py-2 px-3 text-slate-500 hover:bg-gray-50 active:bg-slate-500/10"
        >
          {didCopy ? (
            <ClipboardCheck className="h-5" />
          ) : (
            <ClipboardCopy className="h-5" />
          )}
        </button>
      </div>
      <div className="text-sm text-slate-400">{description}</div>
    </div>
  );
};

const AdminPanel = () => {
  const { poll } = usePoll();
  const { t } = useTranslation("app");
  const { openLoginModal } = useLoginModal();
  const { user } = useUser();
  return (
    <div className="card-mobile">
      <div className="justify flex justify-between font-bold">
        <div className="flex text-sm sm:text-lg">
          {t("administrationPanel")}
        </div>
        <div className="flex space-x-2">
          <NotificationsToggle />
          <Link href={`/admin/${poll.adminUrlId}/manage`}>
            <a className="btn-default">{t("manage")} &rarr;</a>
          </Link>
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {!poll.user && user.isGuest ? (
          <div className="flex rounded-md bg-amber-500/5 p-2">
            <Exclamation className="mr-2 h-5 text-amber-500" />
            <div className="text-sm text-amber-700/75">
              <Trans
                t={t}
                i18nKey="guestPollWarning"
                components={{
                  a: (
                    <LinkText
                      href="/login"
                      className="text-amber-700/75 underline hover:text-amber-700 active:text-amber-700/50"
                      onClick={(e) => {
                        e.preventDefault();
                        openLoginModal();
                      }}
                    />
                  ),
                  b: <strong />,
                }}
              />
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClipboardLink
            title={t("adminLink")}
            icon={Key}
            url={`${window.location.origin}/admin/${poll.adminUrlId}`}
            description={t("adminLinkDescription")}
          />
          <ClipboardLink
            icon={UserGroup}
            title={t("participantLink")}
            url={`${window.location.origin}/p/${poll.participantUrlId}`}
            description={t("participantLinkDescription")}
          />
        </div>
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

  return (
    <AppLayout
      hideBreadcrumbs={!poll.admin}
      breadcrumbs={[{ title: <>&larr; {t("meetingPolls")}</>, href: "/polls" }]}
      title={poll.title}
    >
      <UserAvatarProvider seed={poll.id} names={names}>
        <Head>
          <title>{poll.title}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="max-w-full sm:space-y-4">
          <LayoutGroup>
            {poll.admin ? <AdminPanel /> : null}
            {poll.closed ? (
              <div className="break-container flex bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:rounded-lg">
                <div className="mr-2 rounded-md">
                  <LockClosed className="w-6" />
                </div>
                <div>{t("pollHasBeenLocked")}</div>
              </div>
            ) : null}
            <motion.div
              layout="position"
              initial={false}
              className="card space-y-4"
            >
              <div className="space-y-4 rounded-lg">
                <AppLayoutHeading
                  title={preventWidows(poll.title)}
                  description={<PollSubheader />}
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
