import { motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import React from "react";

import Calendar from "@/components/icons/calendar.svg";
import Chat from "@/components/icons/chat.svg";
import Plus from "@/components/icons/plus-sm.svg";
import Search from "@/components/icons/search.svg";

import { AppLayout, AppLayoutHeading } from "../components/app-layout";
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
      <div className="flex h-96 items-center justify-center text-slate-400">
        <div className="space-y-4 text-center">
          <Calendar className=" inline-block h-20" />
          <div className="">{t("pollsEmpty")}</div>
        </div>
      </div>
    );
  }

  const polls = data.filter(({ title }) =>
    title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-between space-x-8">
        <TextInput
          value={query}
          icon={Search}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full sm:w-64"
        />
      </div>
      <div className="space-y-4">
        {polls.map((poll) => {
          const participantNames = poll.participants.map(({ name }) => name);
          return (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout="position"
              key={poll.id}
              className="flex overflow-hidden rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mr-4 block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10">
                  <Calendar className="h-5 text-primary-500" />
                </div>
              </div>
              <div className="grow">
                <div className="flex justify-between space-x-2">
                  <Link href={`/admin/${poll.adminUrlId}`}>
                    <a className="font-semibold text-slate-700 hover:text-slate-700 hover:underline active:text-slate-700/75">
                      {poll.title}
                    </a>
                  </Link>
                </div>
                <div className="mb-4 text-sm text-slate-400">
                  {dayjs(poll.createdAt).format("LLL")}
                </div>
                <div className="flex space-x-4">
                  <UserAvatarProvider names={participantNames} seed={poll.id}>
                    <SummarizedParticipantBubbles
                      participants={participantNames}
                    />
                  </UserAvatarProvider>
                  <Tooltip
                    content={t("commentCount", { count: poll._count.comments })}
                  >
                    <div className="flex items-center text-sm text-slate-500">
                      <Chat className="mr-1 h-4" />
                      <div>{poll._count.comments}</div>
                    </div>
                  </Tooltip>
                  {poll.closed ? (
                    <div className="text-blue-500">{t("locked")}</div>
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
    <AppLayout title={t("meetingPolls")}>
      <AppLayoutHeading
        className="mb-4"
        title={t("meetingPolls")}
        description="Ask participants which days and times they are available to meet."
        actions={
          <Link href="/new">
            <a className="btn-primary pr-4">
              <Plus className="-ml-1 mr-1 h-5" />
              {t("newPoll")}
            </a>
          </Link>
        }
      />
      <Polls />
    </AppLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app"]),
);

export default withUserSession(Page);
