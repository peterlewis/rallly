import clsx from "clsx";
import * as React from "react";
import { string } from "zod";

export interface CompactButtonProps {
  className?: string;
  icon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  active?: boolean;
}

const CompactButton: React.VoidFunctionComponent<CompactButtonProps> = ({
  icon: Icon,
  children,
  onClick,
  disabled,
  className,
  active,
}) => {
  return (
    <button
      disabled={disabled}
      type="button"
      className={clsx(
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-500/10 hover:text-slate-500 active:bg-slate-500/20",
        className,
        {
          "bg-slate-500/10": active,
        },
      )}
      onClick={onClick}
    >
      {Icon ? <Icon className="h-3 w-3" /> : children}
    </button>
  );
};

export default CompactButton;
