import * as React from "react";

export interface CompactButtonProps {
  icon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  children?: React.ReactNode;
  onClick?: () => void;
}

const CompactButton: React.VoidFunctionComponent<CompactButtonProps> = ({
  icon: Icon,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="hover:bg-slate-500/15 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-500/10 text-slate-400 transition-colors active:bg-slate-500/20"
      onClick={onClick}
    >
      {Icon ? <Icon className="h-3 w-3" /> : children}
    </button>
  );
};

export default CompactButton;
