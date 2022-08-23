import { GetServerSideProps, NextPage } from "next";
import React from "react";

import PollPage from "@/components/poll";
import { PollContextProvider } from "@/components/poll-provider";

import { ParticipantsProvider } from "../components/participants-provider";
import { withUserSession } from "../components/user-provider";
import { withSessionSsr } from "../utils/auth";
import { withPageTranslations } from "../utils/with-page-translations";

const PollPageLoader: NextPage = () => {
  return (
    <PollContextProvider>
      <ParticipantsProvider>
        <PollPage />
      </ParticipantsProvider>
    </PollContextProvider>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app", "errors", "timeZones", "login"]),
);

export default withUserSession(PollPageLoader);
