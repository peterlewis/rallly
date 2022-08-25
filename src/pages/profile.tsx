import { motion } from "framer-motion";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { withSessionSsr } from "@/utils/auth";

import { AppLayout, AppLayoutHeading } from "../components/app-layout";
import { Button } from "../components/button";
import { TextInput } from "../components/text-input";
import {
  useAuthenticatedUser,
  withUserSession,
} from "../components/user-provider";
import { requiredString, validEmail } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { withPageTranslations } from "../utils/with-page-translations";

const MotionButton = motion(Button);

const formId = "update-profile";

const Page: NextPage = () => {
  const { t } = useTranslation("app");
  const { user, setUser } = useAuthenticatedUser();

  const { register, formState, handleSubmit, reset } = useForm<{
    name: string;
    email: string;
  }>({
    defaultValues: { name: user.name, email: user.email },
  });

  const changeName = trpc.useMutation("user.changeName", {
    onSuccess: (_, { name }) => {
      setUser({ ...user, name });
    },
  });

  const { dirtyFields } = formState;

  return (
    <AppLayout title={t("profile")}>
      <AppLayoutHeading
        title={t("profile")}
        description={t("profileDescription")}
        actions={
          <div>
            <MotionButton
              variants={{
                hidden: { opacity: 0, x: 10 },
                visible: { opacity: 1, x: 0 },
              }}
              form={formId}
              transition={{ duration: 0.1 }}
              initial="hidden"
              animate={formState.isDirty ? "visible" : "hidden"}
              htmlType="submit"
              loading={formState.isSubmitting}
              type="primary"
            >
              {t("save")}
            </MotionButton>
          </div>
        }
      />
      <form
        id={formId}
        onSubmit={handleSubmit(async (data) => {
          if (dirtyFields.name) {
            await changeName.mutateAsync({ name: data.name });
          }
          reset(data);
        })}
        className="mb-4 px-4"
      >
        <div className="divide-y">
          <div className="flex py-4">
            <label htmlFor="name" className="w-1/3 text-slate-700">
              {t("name")}
            </label>
            <div className="w-2/3">
              <TextInput
                id="name"
                className="input w-full"
                placeholder="Jessie"
                readOnly={formState.isSubmitting}
                error={!!formState.errors.name}
                {...register("name", {
                  validate: requiredString,
                })}
              />
              {formState.errors.name ? (
                <div className="mt-1 text-sm text-rose-500">
                  {t("requiredNameError")}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex py-4">
            <label htmlFor="random-8904" className="w-1/3 text-slate-700">
              {t("email")}
            </label>
            <div className="w-2/3">
              <TextInput
                id="random-8904"
                className="input w-full"
                placeholder="jessie.jackson@example.com"
                disabled={true}
                {...register("email", { validate: validEmail })}
              />
            </div>
          </div>
        </div>
      </form>
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
