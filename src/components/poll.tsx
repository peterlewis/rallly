import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import toast from "react-hot-toast";
import { useCopyToClipboard } from "react-use";

import Discussion from "@/components/discussion";
import Bell from "@/components/icons/bell.svg";
import Calendar from "@/components/icons/calendar.svg";
import Chart from "@/components/icons/chart.svg";
import Chat from "@/components/icons/chat.svg";
import ClipboardCheck from "@/components/icons/clipboard-check.svg";
import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import DocumentText from "@/components/icons/document-text.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import LinkIcon from "@/components/icons/link.svg";
import LocationMarker from "@/components/icons/location-marker.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import Pencil from "@/components/icons/pencil.svg";
import Plus from "@/components/icons/plus.svg";
import Share from "@/components/icons/share.svg";
import UserGroup from "@/components/icons/user-group.svg";
import X from "@/components/icons/x.svg";
import { preventWidows } from "@/utils/prevent-widows";

import poll from "../pages/poll";
import { DayjsProvider } from "../utils/dayjs";
import { AppLayout, AppLayoutHeading, NewLayout } from "./app-layout";
import { useLoginModal } from "./auth/login-modal";
import { Button } from "./button";
import CompactButton from "./compact-button";
import { LinkText } from "./link-text";
import ModalProvider from "./modal/modal-provider";
import { useParticipants } from "./participants-provider";
import { ConnectedPoll } from "./poll/grid-view-poll";
import NotificationsToggle from "./poll/notifications-toggle";
import PollSubheader from "./poll/poll-subheader";
import { ConnectedPollViz, PollViz } from "./poll/poll-viz";
import TruncatedLinkify from "./poll/truncated-linkify";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import VoteIcon from "./poll/vote-icon";
import { usePoll } from "./poll-provider";
import { Section } from "./section";
import { FormField } from "./settings";
import { TextInput } from "./text-input";
import { usePollMutations } from "./use-poll-mutations";
import { useUser } from "./user-provider";

const Legend = () => {
  const { t } = useTranslation("app");
  return (
    <div className="flex h-8 items-center space-x-3">
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="yes" />
        <span className="text-sm text-slate-500">{t("yes")}</span>
      </span>
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="ifNeedBe" />
        <span className="text-sm text-slate-500">{t("ifNeedBe")}</span>
      </span>
      <span className="inline-flex items-center space-x-1">
        <VoteIcon type="no" />
        <span className="text-sm text-slate-500">{t("no")}</span>
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
      <div className={clsx("mb-2 flex items-center space-x-2")}>
        <div className="flex items-center">
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
              className="text-xs text-gray-400"
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
            "grow py-2 pl-2 text-slate-700 transition-opacity sm:text-base",
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
          className={clsx("py-2 px-3 hover:bg-gray-50 active:bg-slate-500/10", {
            "text-green-500": didCopy,
            "text-slate-500": !didCopy,
          })}
        >
          {didCopy ? (
            <ClipboardCheck className="h-5" />
          ) : (
            <ClipboardCopy className="h-5" />
          )}
        </button>
      </div>
      <div className="text-gray-400">{description}</div>
    </div>
  );
};

const EditableSection: React.VoidFunctionComponent<SectionProps> = ({
  children,
  ...props
}) => {
  const [isEditing, setEditing] = React.useState(false);
  const { t } = useTranslation("app");
  return (
    <Section
      {...props}
      actions={
        isEditing ? null : (
          <Button
            onClick={() => {
              setEditing(true);
            }}
            icon={<Pencil />}
          >
            Edit
          </Button>
        )
      }
    >
      {children}
      {isEditing ? (
        <div className="action-group mt-4">
          <Button type="primary">{t("save")}</Button>
          <Button
            onClick={() => {
              setEditing(false);
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      ) : null}
    </Section>
  );
};

const DescriptionSection = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  return (
    <EditableSection icon={DocumentText} title={t("description")}>
      <div
        className={clsx("text-lg", {
          "text-slate-400": !poll.description,
        })}
      >
        {poll.description || "Not specified"}
      </div>
    </EditableSection>
  );
};

const LocationSection = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  return (
    <EditableSection icon={LocationMarker} title={t("location")}>
      <div
        className={clsx("text-lg", {
          "text-slate-400": !poll.location,
        })}
      >
        {poll.location || "Not specified"}
      </div>
    </EditableSection>
  );
};

const AdminPanel: React.VoidFunctionComponent<{ children?: React.ReactNode }> =
  ({ children }) => {
    const { poll } = usePoll();
    const { t } = useTranslation("app");
    const { openLoginModal } = useLoginModal();
    const { user } = useUser();
    if (!poll.admin) {
      return <>{children}</>;
    }
    return (
      <div className="">
        {/* <div className="py-4 sm:mb-4 sm:py-2 sm:px-3">
          <div className="justify flex flex-col justify-between gap-2 font-bold">
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
                <Exclamation className="mr-2 h-5 text-amber-600/75" />
                <div className="text-sm text-amber-600/75">
                  <Trans
                    t={t}
                    i18nKey="guestPollWarning"
                    components={{
                      a: (
                        <LinkText
                          href="/login"
                          className="text-amber-600/75 underline hover:text-amber-600 active:text-amber-600/50"
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
        </div> */}
        <div>{children}</div>
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
    <DayjsProvider>
      <ModalProvider>
        <NewLayout
          title={poll.title}
          actions={
            <div className="action-group">
              <NotificationsToggle />
              <Button icon={<DotsHorizontal />} />
            </div>
          }
          backHref="/polls"
        >
          <UserAvatarProvider seed={poll.id} names={names}>
            <Head>
              <title>{poll.title}</title>
              <meta name="robots" content="noindex,nofollow" />
            </Head>
            <div className="mx-auto max-w-4xl sm:space-y-4">
              <AdminPanel>
                {poll.closed ? (
                  <div className="mobile:edge-4 flex bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:rounded-md">
                    <div className="mr-2 rounded-md">
                      <LockClosed className="w-6" />
                    </div>
                    <div>{t("pollHasBeenLocked")}</div>
                  </div>
                ) : null}
                <div className="">
                  {/* <div className="space-y-4">
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
              </div> */}
                  <Section
                    title={t("participantLink")}
                    icon={LinkIcon}
                    actions={
                      <Button icon={<ClipboardCopy />}>{t("copyLink")}</Button>
                    }
                  >
                    <input
                      className="w-full rounded-sm font-mono text-xl outline-none focus:ring-2 focus:ring-offset-2"
                      value={`${window.location.origin}/p/${poll.participantUrlId}`}
                      readOnly={true}
                    />
                  </Section>
                  <DescriptionSection />
                  <LocationSection />
                  <Section
                    title={t("Poll")}
                    icon={Chart}
                    actions={
                      <div className="action-group">
                        <Button icon={<Pencil />}>Edit dates</Button>
                      </div>
                    }
                  >
                    {participants ? <ConnectedPollViz /> : null}
                  </Section>
                  <Discussion />
                </div>
              </AdminPanel>
            </div>
          </UserAvatarProvider>
        </NewLayout>
      </ModalProvider>
    </DayjsProvider>
  );
};

export default PollPage;
