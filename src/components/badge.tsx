import clsx from "clsx";
import React from "react";

const Badge: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  color?: "gray" | "amber" | "green" | "red" | "blue" | "indigo";
  className?: string;
}> = ({ children, color = "gray", className }) => {
  return (
    <div
      className={clsx(
        "inline-flex h-5 items-center rounded-md px-1 text-xs font-semibold text-white lg:text-sm",
        {
          "bg-slate-400": color === "gray",
          "bg-amber-400": color === "amber",
          "bg-green-400": color === "green",
          "bg-rose-400": color === "red",
          "bg-cyan-400": color === "blue",
          "bg-indigo-400": color === "indigo",
        },
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Badge;
