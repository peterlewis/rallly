import clsx from "clsx";
import React from "react";

export const SegmentedButtonGroup: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="flex h-9 divide-x rounded border shadow-sm">{children}</div>
  );
};

export const SegmentedButton: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}> = ({ children, onClick, disabled }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "bg-white px-3 font-medium first:rounded-l last:rounded-r",
        {
          "pointer-events-none  bg-slate-500/5 text-gray-400 shadow-none":
            disabled,
          "shadow-sm hover:bg-gray-50 active:bg-slate-500/5": !disabled,
        },
      )}
    >
      {children}
    </button>
  );
};
