import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import { requiredString, validEmail } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import { LinkText } from "../LinkText";
import { TextInput } from "../text-input";

const VerifyCode: React.VoidFunctionComponent<{
  referrer?: string;
  email: string;
}> = ({ referrer, email }) => {
  const verifyCode = trpc.useMutation("user.verify");
  const { register, handleSubmit, setError, formState } =
    useForm<{ code: string }>();
  const router = useRouter();
  const { t } = useTranslation("login");
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
              message: t("wrongVerificationCode"),
            });
          }
        })}
      >
        <fieldset>
          <div className="mb-4 text-3xl font-bold leading-normal">
            {t("verifyYourEmail")}
          </div>
          <p>
            <Trans
              t={t}
              i18nKey="verificationCodeSent"
              values={{ email }}
              components={{ s: <strong className="whitespace-nowrap" /> }}
            />
          </p>
          <TextInput
            size="lg"
            error={!!formState.errors.code}
            placeholder={t("verificationCodePlaceholder")}
            {...register("code", {
              validate: requiredString,
            })}
          />
          {formState.errors.code?.message ? (
            <p className="mt-2 text-sm text-rose-500">
              {formState.errors.code.message}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-slate-400">
            {t("verificationCodeHelp")}
          </p>
        </fieldset>
        <div className="flex space-x-3">
          <Button
            loading={formState.isSubmitting || formState.isSubmitSuccessful}
            htmlType="submit"
            type="primary"
            className="h-12 px-6"
          >
            {t("continue")}
          </Button>
          <button
            type="button"
            className="rounded-lg px-4 text-slate-500 transition-colors hover:bg-slate-500/10 active:bg-slate-500/20"
          >
            {t("resendVerificationCode")}
          </button>
        </div>
      </form>
    </div>
  );
};

export const RegisterForm: React.VoidFunctionComponent<{
  onClickLogin?: React.MouseEventHandler;
  referrer?: string;
}> = ({ onClickLogin, referrer }) => {
  const { t } = useTranslation("login");
  const { register, handleSubmit, getValues, formState, setError } =
    useForm<{ email: string; name: string }>();
  const login = trpc.useMutation("user.login");
  const router = useRouter();

  if (login.data?.ok) {
    return <VerifyCode referrer={referrer} email={getValues("email")} />;
  }

  return (
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
      <div className="mb-1 text-3xl font-bold">{t("createAnAccount")}</div>
      <fieldset className="mb-4">
        <label htmlFor="email" className="text-slate-500">
          {t("email")}
        </label>
        <TextInput
          className="w-96 max-w-full"
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
      <div className="mt-8 border-t pt-8 text-slate-500">
        <Trans
          t={t}
          i18nKey="alreadyRegistered"
          components={{
            a: <LinkText href="/login" onClick={onClickLogin} />,
          }}
        />
      </div>
    </form>
  );
};

export const LoginForm: React.VoidFunctionComponent<{
  onClickRegister?: React.MouseEventHandler;
  referrer?: string;
}> = ({ onClickRegister, referrer }) => {
  const { t } = useTranslation("login");
  const { register, handleSubmit, getValues, formState, setError } =
    useForm<{ email: string }>();
  const login = trpc.useMutation("user.login");
  const router = useRouter();

  if (login.data?.ok) {
    return <VerifyCode referrer={referrer} email={getValues("email")} />;
  }

  return (
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
      <div className="mb-4 text-3xl font-bold text-slate-700">{t("login")}</div>
      <fieldset className="mb-4">
        <label htmlFor="email" className="text-slate-500">
          {t("email")}
        </label>
        <TextInput
          className="w-96 max-w-full"
          size="lg"
          error={!!formState.errors.email}
          disabled={formState.isSubmitting}
          placeholder={t("emailPlaceholder")}
          {...register("email", { validate: validEmail })}
        />
        {formState.errors.email?.message ? (
          <div className="mt-2 text-sm text-rose-500">
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
      <div className="mt-8 border-t pt-8 text-slate-500">
        <Trans
          t={t}
          i18nKey="notRegistered"
          components={{
            a: <LinkText href="/register" onClick={onClickRegister} />,
          }}
        />
      </div>
    </form>
  );
};
