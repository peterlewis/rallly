import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import React from "react";

import Check from "@/components/icons/check-alt.svg";
import Globe from "@/components/icons/globe.svg";
import LocationMarker from "@/components/icons/location-marker.svg";

const TimeZonePolicyOption: React.VoidFunctionComponent<{
  active: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ active, title, description, icon: Icon, className, onClick }) => {
  return (
    <div
      role="button"
      onClick={onClick}
      className={clsx(
        "flex grow select-none items-start gap-4 rounded-md border px-4 py-3 hover:bg-slate-300/10 active:bg-slate-500/10",
        className,
        {
          "border-primary-500 text-primary-600 ring-1 ring-indigo-500": active,
        },
      )}
    >
      <div className="grow">
        <div className="mb-1 flex items-start">
          <Icon className="mr-4 inline-block w-8" />
          <div>
            <div className="mb-1 font-semibold">{title}</div>
            <div>{description}</div>
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          {
            "border-primary-500 bg-primary-500": active,
            "bg-white": !active,
          },
        )}
      >
        <AnimatePresence initial={false}>
          <motion.span
            variants={{
              active: { scale: 1, rotateX: 0 },
              inactive: { scale: 0, rotateX: 45 },
            }}
            className="inline-flex items-center justify-center text-white"
            animate={active ? "active" : "inactive"}
          >
            <Check className="inline-block h-3" />
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const TimezonePicker: React.VoidFunctionComponent<{
  value: "auto" | "fixed";
  onChange: (value: "auto" | "fixed") => void;
  disabled?: boolean;
  className?: string;
}> = ({ value, onChange, disabled, className }) => {
  const { t } = useTranslation("app");

  return (
    <div className={clsx("flex gap-3", className)}>
      <TimeZonePolicyOption
        icon={Globe}
        title={t("timezonePolicyAutomatic")}
        description={t("timezonePolicyAutomaticDescription")}
        active={value === "auto"}
        disabled={disabled}
        onClick={() => onChange("auto")}
      />
      <TimeZonePolicyOption
        icon={LocationMarker}
        title={t("timezonePolicyFixed")}
        description={t("timezonePolicyFixedDescription")}
        active={value === "fixed"}
        disabled={disabled}
        onClick={() => onChange("fixed")}
      />
    </div>
  );
};
