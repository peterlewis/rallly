import clsx from "clsx";
import React from "react";

export const SegmentedButtonGroup: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <div className="flex h-9 divide-x rounded-md border">{children}</div>;
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
      className={clsx("bg-white px-4 first:rounded-l-md last:rounded-r-md", {
        "bg-gray-200/50 text-gray-400/75": disabled,
        "shadow-sm hover:bg-gray-50 active:bg-slate-500/5": !disabled,
      })}
    >
      {children}
    </button>
  );
};
