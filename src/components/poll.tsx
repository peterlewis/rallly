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

import { Button } from "@/components/button";
import Discussion from "@/components/discussion";
import ChevronDown from "@/components/icons/chevron-down.svg";
import ClipboardCheck from "@/components/icons/clipboard-check.svg";
import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import Cog from "@/components/icons/cog.svg";
import InformationCircle from "@/components/icons/information-circle.svg";
import Key from "@/components/icons/key.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import UserGroup from "@/components/icons/user-group.svg";
import { preventWidows } from "@/utils/prevent-widows";

import { trpc } from "../utils/trpc";
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
import Tooltip from "./tooltip";
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

const ClipboardLink: React.VoidFunctionComponent<{
  className?: string;
  url: string;
  description: React.ReactNode;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  titleClassName?: string;
}> = ({ title, icon: Icon, url, description, titleClassName, className }) => {
  const { t } = useTranslation("app");
  const [state, copyToClipboard] = useCopyToClipboard();
  const [didCopy, setDidCopy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className={className}>
      <div className={clsx("mb-2 flex text-sm text-slate-500", titleClassName)}>
        <div className="flex">
          <Icon className="mr-2 h-5" />
          <span className="font-semibold">{title}</span>
        </div>
        <AnimatePresence>
          {didCopy ? (
            <motion.span
              transition={{ duration: 0.1 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="ml-2 text-slate-400"
            >
              {t("copied")}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="mb-2 flex divide-x overflow-hidden rounded-md border bg-white">
        <input
          ref={inputRef}
          readOnly={true}
          value={url}
          className={clsx("grow py-2 pl-2 text-slate-700 transition-opacity", {
            "bg-slate-500/5": didCopy,
          })}
        />
        <Tooltip content={t("copyLink")}>
          <button
            onClick={() => {
              inputRef.current?.select();
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
        </Tooltip>
      </div>
      <div className="text-slate-400">{description}</div>
    </div>
  );
};

const AdminPanel = () => {
  const { poll } = usePoll();
  const { t } = useTranslation("app");
  const [open, setOpen] = React.useState(true);
  return (
    <div className="break-container overflow-hidden rounded-md border border-dashed p-4">
      <div className="flex justify-between font-medium">
        <div className="flex text-lg">{t("administrationPanel")}</div>
        <div className="flex space-x-2">
          <NotificationsToggle />
          <Link href={`/admin/${poll.adminUrlId}/manage`}>
            <a className="btn-default">
              <Cog className="mr-2 h-5" />
              {t("manage")}
            </a>
          </Link>
          <Button onClick={() => setOpen(!open)}>
            <ChevronDown
              className={clsx("h-5 transition-transform", {
                "-rotate-180": open,
              })}
            />
          </Button>
        </div>
      </div>
      {open ? (
        <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
          <ClipboardLink
            title={t("adminLink")}
            icon={Key}
            url={`${window.location.origin}/admin/${poll.adminUrlId}`}
            description={t("adminLinkDescription")}
          />
          <ClipboardLink
            icon={UserGroup}
            titleClassName="text-primary-500"
            title={t("participantLink")}
            url={`${window.location.origin}/p/${poll.participantUrlId}`}
            description={t("participantLinkDescription")}
          />
        </div>
      ) : null}
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
      hideBreadcrumbs={!poll.admin}
      breadcrumbs={[{ title: <>&larr; {t("meetingPolls")}</>, href: "/polls" }]}
      title={poll.title}
    >
      <UserAvatarProvider seed={poll.id} names={names}>
        <Head>
          <title>{poll.title}</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="max-w-full space-y-4">
          <LayoutGroup>
            {poll.admin ? <AdminPanel /> : null}
            {/* <UnclaimedPollAlert /> */}
            {poll.closed ? (
              <div className="break-container flex bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:rounded-lg">
                <div className="mr-2 rounded-md">
                  <LockClosed className="w-6" />
                </div>
                <div>{t("pollHasBeenLocked")}</div>
              </div>
            ) : null}
            <motion.div layout="position" initial={false} className="space-y-4">
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
