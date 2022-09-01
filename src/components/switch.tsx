import { Switch as HeadlessSwitch } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  srDescription?: string;
  disabled?: boolean;
}

const Switch: React.VoidFunctionComponent<SwitchProps> = ({
  checked = false,
  onChange,
  srDescription,
  disabled,
  ...rest
}) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={clsx(
        "relative inline-flex h-6 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75",
        {
          "bg-slate-500/20": !checked,
          "bg-green-500": checked,
          "opacity-50": disabled,
        },
      )}
      {...rest}
    >
      {srDescription ? <span className="sr-only">{srDescription}</span> : null}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          {
            "translate-x-4": checked,
            "translate-x-0": !checked,
          },
        )}
      />
    </HeadlessSwitch>
  );
};

export default Switch;
