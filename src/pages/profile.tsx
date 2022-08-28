import { NextPage } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import { withSessionSsr } from "@/utils/auth";

import { AppLayout, AppLayoutHeading } from "../components/app-layout";
import { Button } from "../components/button";
import { TextInput } from "../components/text-input";
import {
  useAuthenticatedUser,
  withUserSession,
} from "../components/user-provider";
import { useFormValidation } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

const FormField: React.VoidFunctionComponent<
  React.PropsWithChildren<{
    name: string;
    error?: string;
    help?: React.ReactNode;
  }>
> = ({ name, children, help, error }) => {
  return (
    <div className="py-4 sm:flex sm:space-x-3">
      <div className="mb-2 sm:w-48">
        <label className="font-semibold">{name}</label>
      </div>
      <div className="sm:w-96">
        <div>{children}</div>
        {help ? (
          <div className="mt-2 text-sm text-slate-400">{help}</div>
        ) : null}
        {error ? (
          <div className="mt-1 text-sm text-rose-500">{error}</div>
        ) : null}
      </div>
    </div>
  );
};

const ChangeNameForm = () => {
  const { t } = useTranslation("app");
  const { user, setUser } = useAuthenticatedUser();

  const { register, formState, handleSubmit, reset } = useForm<{
    name: string;
  }>({
    defaultValues: { name: user.name },
  });

  const { requiredString } = useFormValidation();
  const changeName = trpc.useMutation("user.changeName", {
    onSuccess: (_, { name }) => {
      setUser({ ...user, name });
    },
  });

  const { dirtyFields } = formState;

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        if (dirtyFields.name) {
          await changeName.mutateAsync({ name: data.name });
        }
        reset(data);
      })}
    >
      <FormField name={t("name")} error={formState.errors.name?.message}>
        <div className="flex space-x-3">
          <TextInput
            id="name"
            className="w-full"
            placeholder={t("namePlaceholder")}
            readOnly={formState.isSubmitting}
            error={!!formState.errors.name}
            {...register("name", {
              validate: requiredString(t("name")),
            })}
          />
          <Button htmlType="submit" loading={formState.isSubmitting}>
            {t("save")}
          </Button>
        </div>
      </FormField>
    </form>
  );
};

const ChangeEmailForm = () => {
  const { t } = useTranslation("app");

  return (
    <FormField
      name={t("email")}
      help="It's not possible to change your email at this time."
    >
      <TextInput
        id="email"
        className="w-full"
        placeholder={t("emailPlaceholder")}
        disabled={true}
      />
    </FormField>
  );
};

const Page: NextPage = () => {
  const { t } = useTranslation("app");

  return (
    <AppLayout title={t("profile")}>
      <AppLayoutHeading
        title={t("profile")}
        description={t("profileDescription")}
        className="mb-8"
      />
      <div className="space-y-4 sm:space-y-8">
        <div>
          <div className="text-lg font-semibold sm:mb-4">
            {t("yourDetails")}
          </div>
          <div className="divide-y">
            <ChangeNameForm />
            <ChangeEmailForm />
          </div>
        </div>
        <div>
          <div className="mb-4 text-lg font-semibold">{t("yourPolls")}</div>
          <div>
            <Link href="/polls">
              <a>{t("goToPolls")}</a>
            </Link>
          </div>
        </div>
      </div>
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
