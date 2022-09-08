import clsx from "clsx";
import * as React from "react";

interface ButtonGroupProps<T extends string> {
  value?: T;
  onChange?: (value: T) => void;
  className?: string;
  size?: "small" | "default";
  options: Array<{
    label: React.ReactNode;
    value: T;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export const RadioGroup = <T extends string>({
  value,
  onChange,
  options,
  className,
  size = "default",
}: ButtonGroupProps<T>) => {
  return (
    <div
      className={clsx(
        "inline-flex items-center divide-x rounded-md border bg-slate-500/5",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            type="button"
            key={option.value}
            className={clsx(
              "flex grow items-center justify-center font-medium first:rounded-r-none last:rounded-l-none",
              {
                "bg-white text-primary-500 shadow-sm ": option.value === value,
                "hover:bg-slate-500/5 active:bg-slate-500/10":
                  option.value !== value,
                "h-9 rounded-md px-3": size === "default",
                "h-8 rounded-md px-3 text-sm": size === "small",
              },
            )}
            onClick={() => onChange?.(option.value)}
          >
            {Icon ? (
              <Icon
                className={clsx("mr-2 shrink-0", {
                  "h-5": size === "default",
                  "h-4": size === "small",
                })}
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
