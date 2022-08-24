import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import Logo from "~/public/logo.svg";

import { Button } from "../components/button";
import { LinkText } from "../components/LinkText";
import { TextInput } from "../components/text-input";
import { withSessionSsr } from "../utils/auth";
import { validEmail } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage = () => {
  const { register, handleSubmit, formState, setError } =
    useForm<{ email: string; password: string }>();
  const login = trpc.useMutation("user.login");
  const router = useRouter();
  const { t } = useTranslation("login");
  return (
    <div className="flex h-full">
      <Head>
        <title>{t("login")}</title>
      </Head>

      <div className="flex w-2/3 items-center p-16 md:p-32">
        <div className="">
          <div className="mb-8">
            <Logo className="h-9 text-primary-500" />
          </div>
          <div className="mb-4 text-3xl font-bold leading-normal">
            {t("login")}
          </div>
          {login.data?.ok === true ? (
            <div>Please check your email to proceed.</div>
          ) : (
            <form
              onSubmit={handleSubmit(async (data) => {
                const res = await login.mutateAsync({
                  email: data.email,
                  redirect: router.query.redirect as string,
                });
                if (!res.ok) {
                  setError("email", {
                    type: "not_found",
                    message: t("userNotFound"),
                  });
                }
              })}
            >
              <fieldset className="mb-4">
                <label htmlFor="email">{t("email")}</label>
                <TextInput
                  className="w-96"
                  size="lg"
                  disabled={formState.isSubmitting}
                  placeholder={t("emailPlaceholder")}
                  {...register("email", { validate: validEmail })}
                />
                {formState.errors.email ? (
                  <div className="mt-1 text-sm text-rose-500">
                    {formState.errors.email.message}
                  </div>
                ) : null}
              </fieldset>
              <Button
                loading={formState.isSubmitting}
                htmlType="submit"
                type="primary"
                className="h-12 px-6"
              >
                {t("login")}
              </Button>
            </form>
          )}
          <div className="mt-8 border-t py-8">
            <p className="text-slate-500">
              <Trans
                t={t}
                i18nKey="notRegistered"
                components={{ a: <LinkText href="/register" /> }}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
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

    return await withPageTranslations(["common", "login"])(ctx);
  },
);

export default Page;
