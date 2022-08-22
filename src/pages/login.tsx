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

const VerifyCode: React.VoidFunctionComponent<{ referrer?: string }> = ({
  referrer,
}) => {
  const verifyCode = trpc.useMutation("user.verify");
  const { register, handleSubmit, setError, formState } =
    useForm<{ code: string }>();
  const router = useRouter();
  return (
    <div>
      <form
        onSubmit={handleSubmit(async ({ code }) => {
          const { ok } = await verifyCode.mutateAsync({ code });
          if (ok) {
            router.replace(referrer ?? "/polls");
          } else {
            setError("code", {
              type: "not_found",
              message: "",
            });
          }
        })}
      >
        <fieldset>
          <TextInput
            size="lg"
            maxLength={6}
            placeholder="Enter 6-digit code"
            {...register("code")}
          />
          <p className="mt-1 text-sm text-slate-400">
            Didn't get the email? Check your spam/junk.
          </p>
          {formState.errors.code ? (
            <div className="mt-1 text-sm text-rose-500">
              {formState.errors.code.message}
            </div>
          ) : null}
        </fieldset>
        <Button
          loading={formState.isSubmitting}
          type="primary"
          htmlType="submit"
        >
          Continue
        </Button>
      </form>
    </div>
  );
};

const Page: NextPage<{ referrer?: string }> = ({ referrer }) => {
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
            <VerifyCode referrer={referrer} />
          ) : (
            <form
              onSubmit={handleSubmit(async (data) => {
                const res = await login.mutateAsync({
                  email: data.email,
                  redirect: (router.query.redirect as string) ?? referrer,
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
                {t("continue")}
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
