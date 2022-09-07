import clsx from "clsx";
import * as React from "react";

export interface TextInputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "size"
  > {
  error?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  suffix?: React.ReactNode;
  size?: "lg" | "md";
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      className,
      error,
      size = "md",
      icon: Icon,
      onFocus,
      onBlur,
      suffix,
      ...forwardProps
    },
    ref,
  ) {
    const [focused, setFocused] = React.useState(false);
    return (
      <span
        className={clsx(
          "flex items-center rounded-md border bg-white text-slate-700 ",
          {
            "h-9 px-2": size === "md",
            "h-12 px-3": size === "lg",
            "border-gray-300": !error,
            "input-error": error,
            "bg-slate-50 text-slate-500": forwardProps.disabled,
            "border-primary-500 ring-1 ring-primary-500": focused,
          },
          className,
        )}
      >
        <input
          ref={ref}
          type="text"
          className={clsx(
            "h-full w-full appearance-none border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
            {
              "text-xl": size === "lg",
            },
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...forwardProps}
        />
        {Icon && (
          <Icon
            className={clsx("mr-1 h-5 shrink-0", {
              "text-gray-500": focused,
              "text-gray-400": !focused,
            })}
          />
        )}
        {suffix}
      </span>
    );
  },
);
