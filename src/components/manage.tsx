import clsx from "clsx";
import { useTranslation } from "next-i18next";
import React from "react";

import Pencil from "@/components/icons/pencil.svg";

import { AppLayout, AppLayoutHeading } from "./app-layout";
import { Advanced } from "./manage/advanced";
import { General } from "./manage/general";
import { Options } from "./manage/options";
import { Section } from "./section";

export const Manage: React.VFC = () => {
  const { t } = useTranslation("app");
  return (
    <div className="space-y-4">
      <Section title={t("details")} subtitle="Change your poll details">
        <General />
      </Section>
      <Section
        title={t("options")}
        subtitle="Add or remove options from your poll"
      >
        <Options />
      </Section>
      {/* <Section title={t("advanced")}>
        <Advanced />
      </Section> */}
    </div>
  );
};
