import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { AuthLayout } from "../components/auth/auth-layout";
import { LoginForm } from "../components/auth/login-form";
import { withSessionSsr } from "../utils/auth";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage<{ referer: string | null }> = () => {
  const { t } = useTranslation("app");
  const router = useRouter();
  return (
    <AuthLayout>
      <Head>
        <title>{t("login")}</title>
      </Head>
      <LoginForm
        onAuthenticated={() => {
          router.replace("/polls");
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

    return await withPageTranslations(["common", "app"])(ctx);
  },
);

export default Page;
