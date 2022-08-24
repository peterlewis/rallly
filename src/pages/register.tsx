import { NextPage } from "next";
import Head from "next/head";
import { Trans, useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import Logo from "~/public/logo.svg";

import { Button } from "../components/button";
import { LinkText } from "../components/LinkText";
import { TextInput } from "../components/text-input";
import { requiredString, validEmail } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

const Page: NextPage = () => {
  const createUser = trpc.useMutation("user.register");
  const { register, handleSubmit, formState } =
    useForm<{
      name: string;
      email: string;
    }>();
  const { t } = useTranslation("register");
  return (
    <div className="flex h-full justify-center">
      <Head>
        <title>{t("register")}</title>
      </Head>
      <div className="p-16">
        <div className="w-96">
          <div className="mb-8">
            <Logo className="h-8 text-primary-500" />
          </div>
          <div className="mb-4 text-3xl font-bold leading-normal">
            {t("registerTitle")}
          </div>
          {formState.isSubmitSuccessful ? (
            <div>{t("verifyEmail")}</div>
          ) : (
            <form
              onSubmit={handleSubmit(async (data) => {
                await createUser.mutateAsync(data);
              })}
            >
              <fieldset className="mb-4">
                <label htmlFor="name">{t("name")}</label>
                <TextInput
                  placeholder={t("namePlaceholder")}
                  className="w-full"
                  disabled={formState.isSubmitting}
                  size="lg"
                  {...register("name", {
                    validate: requiredString,
                  })}
                />
              </fieldset>
              <fieldset className="mb-4">
                <label htmlFor="email">{t("email")}</label>
                <TextInput
                  placeholder={t("emailPlaceholder")}
                  disabled={formState.isSubmitting}
                  className="w-full"
                  size="lg"
                  autoComplete="username"
                  {...register("email", {
                    validate: validEmail,
                  })}
                />
              </fieldset>
              <Button
                type="primary"
                htmlType="submit"
                loading={formState.isSubmitting}
                className="h-12 px-6"
              >
                {t("createAccount")}
              </Button>
            </form>
          )}
          <div className="mt-8 border-t py-8">
            <p className="text-slate-500">
              <Trans
                t={t}
                i18nKey="alreadyHaveAccount"
                components={{
                  a: <LinkText href="/login" />,
                }}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = withPageTranslations(["register"]);

export default Page;
