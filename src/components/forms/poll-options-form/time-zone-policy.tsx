import { offset, useFloating } from "@floating-ui/react-dom";
import { flip, FloatingPortal } from "@floating-ui/react-dom-interactions";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import React from "react";

import Check from "@/components/icons/check-alt.svg";
import ChevronDown from "@/components/icons/chevron-down.svg";
import Globe from "@/components/icons/globe.svg";
import LocationMarker from "@/components/icons/location-marker.svg";

import { Button } from "../../button";

const TimeZonePolicyOption: React.VoidFunctionComponent<{
  active: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
}> = ({ active, title, description, icon: Icon, className }) => {
  return (
    <div
      className={clsx(
        "flex max-w-sm cursor-default select-none items-start space-x-4 px-4 py-3 transition-all hover:bg-slate-300/10 active:bg-slate-500/10",
        className,
      )}
    >
      <div className="grow">
        <div className="mb-2 flex items-center">
          <Icon className="mr-2 inline-block w-5 text-slate-400" />
          <div className="font-medium">{title}</div>
        </div>
        <div className="text-sm leading-normal text-slate-500">
          {description}
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

const Options = motion(Listbox.Options);

export const TimezonePicker: React.VoidFunctionComponent<{
  value: "auto" | "fixed";
  onChange: (value: "auto" | "fixed") => void;
  disabled?: boolean;
  className?: string;
}> = ({ value, onChange, disabled, className }) => {
  const { t } = useTranslation("app");
  const { reference, floating, x, y, strategy } = useFloating({
    strategy: "fixed",
    placement: "top-start",
    middleware: [offset(10), flip()],
  });
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <Listbox.Button
            ref={reference}
            as={Button}
            className={clsx("shadow-none", className)}
          >
            {value === "auto" ? (
              <div className="flex items-center">
                <Globe className="mr-2 inline-block w-5 text-slate-400" />
                <div className="">{t("timezonePolicyAutomatic")}</div>
              </div>
            ) : (
              <div className="flex items-center">
                <LocationMarker className="mr-2 inline-block w-5 text-slate-400" />
                <div className="">{t("timezonePolicyFixed")}</div>
              </div>
            )}
            <ChevronDown className="ml-2 h-5" />
          </Listbox.Button>
          <FloatingPortal>
            <AnimatePresence>
              {open && (
                <Options
                  static={true}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  ref={floating}
                  className="z-10 divide-y overflow-hidden rounded-lg border bg-white shadow-lg"
                  style={{
                    position: strategy,
                    left: x ?? "",
                    top: y ?? "",
                  }}
                >
                  <Listbox.Option value="auto">
                    {({ selected }) => (
                      <TimeZonePolicyOption
                        icon={Globe}
                        title={t("timezonePolicyAutomatic")}
                        description={t("timezonePolicyAutomaticDescription")}
                        active={selected}
                      />
                    )}
                  </Listbox.Option>
                  <Listbox.Option value="fixed">
                    {({ selected }) => (
                      <TimeZonePolicyOption
                        icon={LocationMarker}
                        title={t("timezonePolicyFixed")}
                        description={t("timezonePolicyFixedDescription")}
                        active={selected}
                      />
                    )}
                  </Listbox.Option>
                </Options>
              )}
            </AnimatePresence>
          </FloatingPortal>
        </>
      )}
    </Listbox>
  );
};
