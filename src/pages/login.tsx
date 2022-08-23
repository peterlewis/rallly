import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { AuthLayout } from "../components/auth/auth-layout";
import { LoginForm } from "../components/auth/login-form";
import { withSessionSsr } from "../utils/auth";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage<{ referer: string | null }> = ({ referer }) => {
  const { t } = useTranslation("login");
  const router = useRouter();
  return (
    <AuthLayout>
      <Head>
        <title>{t("login")}</title>
      </Head>
      <LoginForm
        onAuthenticated={() => {
          router.replace(referer ?? "/polls");
        }}
      />
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

    const referer = ctx.req.headers.referer;

    if ("props" in res) {
      return {
        props: {
          ...res.props,
          referer:
            referer &&
            // don't redirect to registration page after logging in
            !referer.includes("/register")
              ? referer
              : null,
        },
      };
    }

    return res;
  },
);

export default Page;
