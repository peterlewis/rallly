import clsx from "clsx";
import { useTranslation } from "next-i18next";
import React from "react";

const Steps = <StepName extends string = string>(props: {
  className?: string;
  current: StepName;
  steps: StepName[];
}) => {
  const { t } = useTranslation("app");

  const currentStepIndex = props.steps.indexOf(props.current);
  return (
    <div className={clsx("inline-flex items-center", props.className)}>
      <div className="text-sm font-medium tracking-tight">
        {t("stepSummary", {
          current: currentStepIndex + 1,
          total: props.steps.length,
        })}
      </div>
      <div className="ml-2 flex items-center">
        {props.steps.map((_, i) => {
          return (
            <span
              key={i}
              className={clsx("ml-3 h-2  w-2 rounded-full transition-all", {
                "bg-primary-400": i <= currentStepIndex,
                "bg-gray-300": i > currentStepIndex,
                "animate-pulse ring-4 ring-primary-200": i === currentStepIndex,
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Steps;
