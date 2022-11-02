import { GetServerSideProps } from "next";

import NewPoll from "@/components/create-poll";
import { withSessionSsr } from "@/utils/auth";

import { withUserSession } from "../components/user-provider";
import { withPageTranslations } from "../utils/with-page-translations";

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  withPageTranslations(["common", "app"]),
);

export default withUserSession(NewPoll);
