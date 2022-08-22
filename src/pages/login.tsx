import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useTranslation } from "next-i18next";

import { AuthLayout } from "../components/auth/auth-layout";
import { LoginForm } from "../components/auth/login-form";
import { withSessionSsr } from "../utils/auth";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage<{ referrer?: string }> = ({ referrer }) => {
  const { t } = useTranslation("login");

  return (
    <AuthLayout>
      <Head>
        <title>{t("login")}</title>
      </Head>
      <LoginForm referrer={referrer} />
    </AuthLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  async (ctx) => {
    if (ctx.req.session.user?.isGuest === false) {
      return {
        redirect: { destination: "/polls" },
        props: {},
      };
    }

    const res = await withPageTranslations(["common", "login"])(ctx);

    if ("props" in res) {
      return {
        props: {
          ...res.props,
          referrer: ctx.req.headers.referer,
        },
      };
    }

    return res;
  },
);

export default Page;
