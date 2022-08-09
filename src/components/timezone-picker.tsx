import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import Check from "@/components/icons/check-alt.svg";
import Globe from "@/components/icons/globe.svg";
import LocationMarker from "@/components/icons/location-marker.svg";

const RadioOption: React.VoidFunctionComponent<{
  onClick: () => void;
  active: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, active, title, description, icon: Icon, className }) => {
  return (
    <div
      className={clsx(
        "flex cursor-default select-none items-start space-x-4 rounded-lg border bg-white px-4 py-3 transition-all ",
        className,
        {
          "active:bg-gray-50": !active,
        },
      )}
      onClick={onClick}
    >
      <div className="grow">
        <div className="mb-2 flex items-center">
          <Icon className="mr-2 inline-block w-5 text-slate-400" />
          <div className="font-bold">{title}</div>
        </div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <div
        className={clsx(
          "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          {
            "border-primary-600 bg-primary-600": active,
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
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div
      className={clsx("flex space-x-4", {
        "pointer-events-none text-gray-400": disabled,
      })}
    >
      <RadioOption
        className="w-1/2 max-w-sm"
        icon={Globe}
        title="Automatic"
        description="Participants will see times adjusted to their timezone."
        active={!!value}
        onClick={() => {
          onChange(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }}
      />
      <RadioOption
        className="w-1/2 max-w-sm"
        icon={LocationMarker}
        title="Fixed"
        description="All participants will see the same times."
        active={value === ""}
        onClick={() => onChange("")}
      />
    </div>
  );
};
