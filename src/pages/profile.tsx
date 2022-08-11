import { NextPage } from "next";
import { useTranslation } from "next-i18next";

import { withSessionSsr } from "@/utils/auth";

import { AppLayout } from "../components/app-layout";
import { UserDetails } from "../components/profile/user-details";
import { withUserSession } from "../components/user-provider";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage = () => {
  const { t } = useTranslation("app");

  return (
    <AppLayout title={t("profile")}>
      <UserDetails />
    </AppLayout>
  );
};

export const getServerSideProps = withSessionSsr(async (ctx) => {
  if (ctx.req.session.user?.isGuest === false) {
    return await withPageTranslations(["common", "app"])(ctx);
  }

  return {
    redirect: {
      destination: "/login",
    },
    props: {},
  };
});

export default withUserSession(Page);
