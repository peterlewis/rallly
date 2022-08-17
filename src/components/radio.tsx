import clsx from "clsx";
import * as React from "react";

interface ButtonGroupProps<T extends string> {
  value?: T;
  onChange?: (value: T) => void;
  options: Array<{ label: React.ReactNode; value: T }>;
}

export const RadioGroup = <T extends string>({
  value,
  onChange,
  options,
}: ButtonGroupProps<T>) => {
  return (
    <div className="inline-flex items-center rounded-md border bg-gray-200/50">
      {options.map((option) => {
        return (
          <button
            type="button"
            key={option.value}
            className={clsx(
              "h-9 rounded-[4px] px-4 font-medium first:rounded-r-none last:rounded-l-none focus:z-10",
              {
                "bg-white text-gray-700 shadow-sm ": option.value === value,
                "border-transparent text-gray-500 hover:text-gray-600 active:bg-gray-200":
                  option.value !== value,
              },
            )}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
