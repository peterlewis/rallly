import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import { RegisteredUserSession } from "../../utils/auth";
import { requiredString, validEmail } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import { LinkText } from "../LinkText";
import { TextInput } from "../text-input";

const VerifyCode: React.VoidFunctionComponent<{
  email: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}> = ({ onSubmit, email, onResend }) => {
  const { register, handleSubmit, setError, formState } =
    useForm<{ code: string }>();
  const { t } = useTranslation("login");
  const [resendStatus, setResendStatus] =
    React.useState<"ok" | "busy" | "disabled">("ok");

  const handleResend = async () => {
    setResendStatus("busy");
    try {
      await onResend();
      setResendStatus("disabled");
      setTimeout(() => {
        setResendStatus("ok");
      }, 1000 * 30);
    } catch {
      setResendStatus("ok");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(async ({ code }) => {
          try {
            await onSubmit(code);
          } catch {
            setError("code", {
              type: "not_found",
              message: t("wrongVerificationCode"),
            });
          }
        })}
      >
        <fieldset>
          <div className="mb-4 text-xl font-bold leading-normal sm:text-3xl">
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
            autoFocus={true}
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
        <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-3">
          <Button
            loading={formState.isSubmitting || formState.isSubmitSuccessful}
            htmlType="submit"
            type="primary"
            className="h-12 w-full px-6 sm:w-auto"
          >
            {t("continue")}
          </Button>
          <Button
            onClick={handleResend}
            loading={resendStatus === "busy"}
            disabled={resendStatus === "disabled"}
            className="h-12 w-full rounded-lg px-4 text-slate-500 transition-colors hover:bg-slate-500/10 active:bg-slate-500/20 sm:w-auto"
          >
            {t("resendVerificationCode")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const RegisterForm: React.VoidFunctionComponent<{
  onClickLogin?: React.MouseEventHandler;
  onRegistered: (user: RegisteredUserSession) => void;
}> = ({ onClickLogin, onRegistered }) => {
  const { t } = useTranslation("login");
  const { register, handleSubmit, getValues, setError, formState } =
    useForm<{ email: string; name: string }>();
  const requestRegistration = trpc.useMutation("auth.requestRegistration");
  const authenticateRegistration = trpc.useMutation(
    "auth.authenticateRegistration",
  );

  const token = requestRegistration.data?.ok
    ? requestRegistration.data?.token
    : null;

  if (token) {
    return (
      <VerifyCode
        onSubmit={async (code) => {
          const res = await authenticateRegistration.mutateAsync({
            token,
            code,
          });

          if (!res.user) {
            throw new Error("Failed to authenticate user");
          }

          onRegistered(res.user);
        }}
        onResend={async () => {
          const values = getValues();
          await requestRegistration.mutateAsync({
            email: values.email,
            name: values.name,
          });
        }}
        email={getValues("email")}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await requestRegistration.mutateAsync({
          email: data.email,
          name: data.name,
        });

        if (!res.ok) {
          switch (res.code) {
            case "userAlreadyExists":
              setError("email", {
                message: t("userAlreadyExists"),
              });
              break;
          }
        }
      })}
    >
      <div className="mb-4 text-xl font-bold sm:text-3xl">
        {t("createAnAccount")}
      </div>
      <fieldset className="mb-4">
        <label htmlFor="name" className="text-slate-500">
          {t("name")}
        </label>
        <TextInput
          className="w-full"
          size="lg"
          autoFocus={true}
          error={!!formState.errors.name}
          disabled={formState.isSubmitting}
          placeholder={t("namePlaceholder")}
          {...register("name", { validate: requiredString })}
        />
        {formState.errors.name?.message ? (
          <div className="mt-2 text-sm text-rose-500">
            {formState.errors.name.message}
          </div>
        ) : null}
      </fieldset>
      <fieldset className="mb-4">
        <label htmlFor="email" className="text-slate-500">
          {t("email")}
        </label>
        <TextInput
          className="w-full"
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
      <div className="mt-4 border-t pt-4 text-sm text-slate-500 sm:mt-8 sm:pt-8 sm:text-base">
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
  onAuthenticated: (user: RegisteredUserSession) => void;
}> = ({ onAuthenticated, onClickRegister }) => {
  const { t } = useTranslation("login");
  const { register, handleSubmit, getValues, formState, setError } =
    useForm<{ email: string }>();
  const requestLogin = trpc.useMutation("auth.requestLogin");
  const authenticateLogin = trpc.useMutation("auth.authenticateLogin");

  const [token, setToken] = React.useState<string>();

  if (token) {
    return (
      <VerifyCode
        onSubmit={async (code) => {
          const res = await authenticateLogin.mutateAsync({
            code,
            token,
          });

          if (!res.user) {
            throw new Error("Failed to authenticate user");
          } else {
            onAuthenticated(res.user);
          }
        }}
        onResend={async () => {
          const values = getValues();
          const res = await requestLogin.mutateAsync({
            email: values.email,
          });

          setToken(res.token);
        }}
        email={getValues("email")}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await requestLogin.mutateAsync({
          email: data.email,
        });

        if (!res.token) {
          setError("email", {
            type: "not_found",
            message: t("userNotFound"),
          });
        } else {
          setToken(res.token);
        }
      })}
    >
      <div className="mb-4 text-xl font-bold text-slate-700 sm:text-3xl">
        {t("login")}
      </div>
      <fieldset className="mb-4">
        <label htmlFor="email" className="text-slate-500">
          {t("email")}
        </label>
        <TextInput
          className="w-full"
          size="lg"
          autoFocus={true}
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
      <div className="mt-4 border-t pt-4 text-sm text-slate-500 sm:mt-8 sm:pt-8 sm:text-base">
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
