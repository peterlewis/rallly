import { VoteType } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";

import CheckCircle from "@/components/icons/check-line.svg";
import IfNeedBe from "@/components/icons/if-need-be-line.svg";
import QuestionMark from "@/components/icons/question-mark.svg";
import X from "@/components/icons/x-line.svg";

const VoteIcon: React.VoidFunctionComponent<{
  type?: VoteType;
  size?: "sm" | "md";
  shape?: "circle" | "square";
  className?: string;
}> = ({ type, className, shape, size = "md" }) => {
  const renderIcon = () => {
    switch (type) {
      case "yes":
        return (
          <CheckCircle
            className={clsx("text-green-500", {
              "h-7": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      case "ifNeedBe":
        return (
          <IfNeedBe
            className={clsx("text-amber-400", {
              "h-7": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      case "no":
        return (
          <X
            className={clsx("text-slate-400", {
              "h-7": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      default:
        return (
          <QuestionMark
            className={clsx("text-slate-300", {
              "h-5": size === "md",
              "h-3": size === "sm",
            })}
          />
        );
    }
  };

  return (
    <span
      className={clsx(
        "justify-centerh-7 inline-flex w-7 items-center",
        className,
      )}
    >
      {renderIcon()}
    </span>
  );
};

export default VoteIcon;
