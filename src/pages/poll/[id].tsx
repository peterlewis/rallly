import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { ParticipantsProvider } from "@/components/participants-provider";
import PollPage from "@/components/poll";
import { PollContextProvider } from "@/components/poll-provider";
import { withUserSession } from "@/components/user-provider";
import { withSessionSsr } from "@/utils/auth";
import { DayjsProvider } from "@/utils/dayjs";
import { withPageTranslations } from "@/utils/with-page-translations";

const PollPageLoader: NextPage = () => {
  return (
    <DayjsProvider>
      <PollContextProvider>
        <ParticipantsProvider>
          <PollPage />
        </ParticipantsProvider>
      </PollContextProvider>
    </DayjsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app", "errors", "timeZones"]),
);

export default withUserSession(PollPageLoader);
