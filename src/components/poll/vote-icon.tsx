import { VoteType } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";

import CheckCircle from "@/components/icons/check-circle.svg";
import IfNeedBe from "@/components/icons/if-need-be.svg";
import QuestionMark from "@/components/icons/question-mark.svg";
import X from "@/components/icons/x-circle.svg";

const VoteIcon: React.VoidFunctionComponent<{
  type?: VoteType;
  size?: "sm" | "md";
  className?: string;
}> = ({ type, className, size = "md" }) => {
  const renderIcon = () => {
    switch (type) {
      case "yes":
        return (
          <CheckCircle
            className={clsx("text-green-400", className, {
              "h-5": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      case "ifNeedBe":
        return (
          <IfNeedBe
            className={clsx("text-amber-300", className, {
              "h-5": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      case "no":
        return (
          <X
            className={clsx("text-slate-300", className, {
              "h-5": size === "md",
              "h-3": size === "sm",
            })}
          />
        );

      default:
        return (
          <QuestionMark
            className={clsx("text-slate-300", className, {
              "h-5": size === "md",
              "h-3": size === "sm",
            })}
          />
        );
    }
  };

  return (
    <span className="relative inline-block h-5 w-5">
      {type !== undefined ? (
        <span className="absolute left-1/2 top-1/2 -z-10 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white" />
      ) : null}
      {renderIcon()}
    </span>
  );
};

export default VoteIcon;
