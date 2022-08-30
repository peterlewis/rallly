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
      className={clsx(
        "bg-white px-4 first:rounded-l-md last:rounded-r-md active:bg-gray-100",
        {
          "bg-gray-100 text-gray-400": disabled,
        },
      )}
    >
      {children}
    </button>
  );
};
