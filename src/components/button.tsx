import clsx from "clsx";
import * as React from "react";

import SpinnerIcon from "@/components/icons/spinner.svg";

export interface ButtonProps
  extends Omit<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "type" | "ref"
  > {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactElement;
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  type?: "default" | "primary" | "danger" | "link" | "ghost" | "success";
  form?: string;
  rounded?: boolean;
  size?: "lg" | "md";
  title?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      loading,
      type = "default",
      htmlType = "button",
      className,
      icon,
      disabled,
      rounded,
      size = "md",
      ...passThroughProps
    },
    ref,
  ) {
    return (
      <button
        role="button"
        ref={ref}
        type={htmlType}
        className={clsx(
          {
            "btn-primary": type === "primary",
            "btn-danger": type === "danger",
            "btn border-green-600 bg-green-500 text-white focus-visible:ring-green-500 hover:bg-green-600":
              type === "success",
            "btn-link": type === "link",
            "inline-flex h-9 items-center justify-center rounded-md px-3 font-medium text-slate-500/90 hover:bg-slate-500/10 active:bg-slate-500/20 ":
              type === "ghost" || type === "default",
            "btn-disabled": disabled,
            "h-auto rounded-full p-2": rounded,
            "h-12 px-6": size === "lg",
            "w-10 p-0": !children,
          },
          className,
        )}
        {...passThroughProps}
        disabled={disabled || loading}
      >
        {loading ? (
          <SpinnerIcon
            className={clsx("inline-block w-5 animate-spin", {
              "mr-2": !!children,
            })}
          />
        ) : icon ? (
          React.cloneElement(icon, {
            className: clsx("w-5 h-5", { "-ml-1 mr-2": !!children }),
          })
        ) : null}
        {children}
      </button>
    );
  },
);
