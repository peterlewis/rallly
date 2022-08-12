import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { AppLayout } from "@/components/app-layout";
import FullPageLoader from "@/components/full-page-loader";
import { Manage } from "@/components/manage";
import { ParticipantsProvider } from "@/components/participants-provider";
import { PollContextProvider } from "@/components/poll-context";
import { withUserSession } from "@/components/user-provider";
import { withSessionSsr } from "@/utils/auth";
import { trpc } from "@/utils/trpc";
import { withPageTranslations } from "@/utils/with-page-translations";

const Page: NextPage = () => {
  const { query } = useRouter();
  const { t } = useTranslation("app");
  const { data: poll } = trpc.useQuery(
    ["polls.get", { urlId: query.adminUrlId as string, admin: true }],
    {
      retry: false,
    },
  );
  if (!poll) {
    return <FullPageLoader>{t("loading")}</FullPageLoader>;
  }
  return (
    <AppLayout
      title="Manage"
      breadcrumbs={[
        {
          href: "/polls",
          title: t("meetingPolls"),
        },
        {
          href: `/admin/${poll.adminUrlId}`,
          title: poll.title,
        },
      ]}
    >
      <ParticipantsProvider pollId={poll.id}>
        <PollContextProvider
          poll={poll}
          admin={poll.admin}
          urlId={poll.adminUrlId}
        >
          <Manage />
        </PollContextProvider>
      </ParticipantsProvider>
    </AppLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app"]),
);

export default withUserSession(Page);
