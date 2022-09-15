import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";

import UserAvatar from "./poll/user-avatar";

interface NameInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  value?: string;
  defaultValue?: string;
}

export const NameInput = React.forwardRef<HTMLInputElement, NameInputProps>(
  function NameInput({ value, defaultValue, className, ...forwardProps }, ref) {
    const { t } = useTranslation("app");
    return (
      <div className="relative flex items-center">
        <UserAvatar
          name={value ?? defaultValue ?? ""}
          className="absolute left-2"
        />
        <input
          ref={ref}
          className={clsx("input pl-[35px]", className)}
          placeholder={t("yourName")}
          value={value}
          {...forwardProps}
        />
      </div>
    );
  },
);
