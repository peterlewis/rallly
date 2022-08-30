import { NextPage } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import { withSessionSsr } from "@/utils/auth";

import { AppLayout, AppLayoutHeading } from "../components/app-layout";
import { Button } from "../components/button";
import { FormField } from "../components/settings";
import { TextInput } from "../components/text-input";
import {
  useAuthenticatedUser,
  withUserSession,
} from "../components/user-provider";
import { useFormValidation } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

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
        className="mb-4 sm:mb-8"
      />
      <div className="space-y-4 sm:space-y-8">
        <div>
          <h2 className="mb-0">{t("yourDetails")}</h2>
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
