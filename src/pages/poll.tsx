import { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import React from "react";

import { PollContextProvider } from "@/components/poll-provider";

import { ParticipantsProvider } from "../components/participants-provider";
import { withUserSession } from "../components/user-provider";
import { withSessionSsr } from "../utils/auth";
import { withPageTranslations } from "../utils/with-page-translations";

const PollPage = dynamic(() => import("@/components/poll"), { ssr: false });

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
  withPageTranslations(["common", "app", "errors", "timeZones"]),
);

export default withUserSession(PollPageLoader);
