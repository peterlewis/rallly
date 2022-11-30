import { motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import React from "react";

import Calendar from "@/components/icons/calendar.svg";
import Chat from "@/components/icons/chat.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import Plus from "@/components/icons/plus-sm.svg";
import Search from "@/components/icons/search.svg";

import {
  AppLayout,
  AppLayoutHeading,
  NewLayout,
} from "../components/app-layout";
import { EmptyState } from "../components/empty-state";
import FullPageLoader from "../components/full-page-loader";
import { UserAvatarProvider } from "../components/poll/user-avatar";
import { SummarizedParticipantBubbles } from "../components/summarized-participant-bubbles";
import { TextInput } from "../components/text-input";
import Tooltip from "../components/tooltip";
import { withUserSession } from "../components/user-provider";
import { withSessionSsr } from "../utils/auth";
import { useDayjs } from "../utils/dayjs";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

const Polls: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");
  const [query, setQuery] = React.useState("");

  const { data } = trpc.useQuery(["polls.list"]);

  const { dayjs } = useDayjs();
  if (!data) {
    return <FullPageLoader>{t("loading")}</FullPageLoader>;
  }

  if (data.length === 0) {
    return (
      <div className="h-96">
        <EmptyState icon={Calendar} text={t("pollsEmpty")} />
      </div>
    );
  }

  const polls = data.filter(({ title }) =>
    title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-8">
        <TextInput
          value={query}
          icon={Search}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full sm:w-64"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {polls.map((poll) => {
          const participantNames = poll.participants.map(({ name }) => name);
          return (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout="position"
              key={poll.id}
              className="flex overflow-hidden rounded-md border p-4"
            >
              <div className="grow">
                <div className="flex justify-between space-x-2">
                  <Link
                    href={`/poll/${poll.id}`}
                    className="text-lg font-semibold text-slate-700 hover:text-slate-700 hover:underline active:text-slate-700/75"
                  >
                    {poll.title}
                  </Link>
                </div>
                <div className="mb-4 text-sm text-slate-400">
                  {dayjs(poll.createdAt).format("LLL")}
                </div>
                <div className="flex space-x-2">
                  {participantNames.length > 0 ? (
                    <UserAvatarProvider names={participantNames} seed={poll.id}>
                      <div className="flex h-7 items-center rounded-full">
                        <SummarizedParticipantBubbles
                          participants={participantNames}
                        />
                      </div>
                    </UserAvatarProvider>
                  ) : null}
                  {poll._count.comments > 0 ? (
                    <Tooltip
                      content={t("commentCount", {
                        count: poll._count.comments,
                      })}
                    >
                      <div className="flex h-7 items-center rounded-full bg-slate-100 px-3 text-sm text-slate-400">
                        <Chat className="mr-1 h-4" />
                        <div>{poll._count.comments}</div>
                      </div>
                    </Tooltip>
                  ) : null}
                  {poll.closed ? (
                    <div className="inline-flex h-7 items-center rounded-full bg-blue-300/20 px-3 text-sm text-blue-500">
                      <LockClosed className="mr-2 h-4" /> {t("locked")}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const Page = () => {
  const { t } = useTranslation("app");

  return (
    <NewLayout title={t("meetingPolls")}>
      <div className="pt-8">
        <AppLayoutHeading
          title={t("meetingPolls")}
          description={t("meetingPollsDescription")}
          actions={
            <Link href="/new" className="btn-primary pr-4">
              <Plus className="-ml-1 mr-1 h-5" />
              {t("newPoll")}
            </Link>
          }
          className="mb-8"
        />
        <Polls />
      </div>
    </NewLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app"]),
);

export default withUserSession(Page);
