import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import React from "react";

import { AppLayout, AppLayoutHeading } from "./app-layout";
import { General } from "./manage/general";
import { Options } from "./manage/options";
import { usePoll } from "./poll-provider";

const TabItem: React.VFC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Tab
      className={({ selected }) =>
        clsx(
          "border-b- -mb-[1px] h-12 border-b-2 px-1 font-medium",
          selected
            ? "border-b-primary-600 text-primary-600"
            : "border-b-transparent text-gray-500 hover:text-gray-600",
        )
      }
    >
      {children}
    </Tab>
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
        />
        <Tab.Group>
          <Tab.List className="sticky top-12 z-20 flex space-x-6 border-b bg-white px-3 sm:static sm:mb-4 sm:px-0">
            <TabItem>{t("General")}</TabItem>
            <TabItem>{t("options")}</TabItem>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <General />
            </Tab.Panel>
            <Tab.Panel>
              <Options />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </AppLayout>
  );
};
