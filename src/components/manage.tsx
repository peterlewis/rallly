import clsx from "clsx";
import { useTranslation } from "next-i18next";
import React from "react";

import { AppLayout, AppLayoutHeading } from "./app-layout";
import { Advanced } from "./manage/advanced";
import { General } from "./manage/general";
import { Options } from "./manage/options";
import { usePoll } from "./poll-provider";

const Section: React.VoidFunctionComponent<{
  className?: string;
  children?: React.ReactNode;
  title: string;
}> = ({ title, className, children }) => {
  return (
    <div className={clsx(className)}>
      <div className="mb-4 text-xl">{title}</div>
      {children}
    </div>
  );
};

export const Manage: React.VFC = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  return (
    <AppLayout
      title={t("manage")}
      breadcrumbs={[
        {
          href: "/polls",
          title: t("groupMeetings"),
        },
        {
          href: `/admin/${poll.adminUrlId}`,
          title: poll.title,
        },
      ]}
    >
      <div className="">
        <AppLayoutHeading
          title={t("manage")}
          description="Manage your poll details and settings"
          className="mb-4"
        />
        <div className="space-y-8">
          <Section title={t("details")}>
            <General />
          </Section>
          <Section title={t("options")}>
            <Options />
          </Section>
          <Section title={t("advanced")}>
            <Advanced />
          </Section>
        </div>
      </div>
    </AppLayout>
  );
};
