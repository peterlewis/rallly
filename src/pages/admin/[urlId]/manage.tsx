import { GetServerSideProps, NextPage } from "next";

import { Manage } from "@/components/manage";
import { ParticipantsProvider } from "@/components/participants-provider";
import { PollContextProvider } from "@/components/poll-provider";
import { withUserSession } from "@/components/user-provider";
import { withSessionSsr } from "@/utils/auth";
import { withPageTranslations } from "@/utils/with-page-translations";

const Page: NextPage = () => {
  return (
    <PollContextProvider>
      <ParticipantsProvider>
        <Manage />
      </ParticipantsProvider>
    </PollContextProvider>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app", "errors"]),
);

export default withUserSession(Page);
