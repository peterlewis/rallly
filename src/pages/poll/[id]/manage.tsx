import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";

import { NewLayout } from "../../../components/app-layout";
import { Manage } from "../../../components/manage";
import { ParticipantsProvider } from "../../../components/participants-provider";
import { PollLayout } from "../../../components/poll/poll-layout";
import {
  PollContextProvider,
  usePoll,
} from "../../../components/poll-provider";
import { TextInput } from "../../../components/text-input";
import { withUserSession } from "../../../components/user-provider";
import { withSessionSsr } from "../../../utils/auth";
import { withPageTranslations } from "../../../utils/with-page-translations";

const Page = () => {
  return (
    <PollContextProvider>
      <ParticipantsProvider>
        <NewLayout>
          <PollLayout>
            <Manage />
          </PollLayout>
        </NewLayout>
      </ParticipantsProvider>
    </PollContextProvider>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app", "errors", "timeZones"]),
);

export default withUserSession(Page);
