import clsx from "clsx";
import * as React from "react";

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  text: React.ReactNode;
  className?: string;
}

export const EmptyState: React.VoidFunctionComponent<EmptyStateProps> = ({
  icon: Icon,
  text,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex h-full items-center justify-center py-12",
        className,
      )}
    >
      <div className="text-center font-medium text-slate-500/50">
        <Icon className="mb-2 inline-block h-16" />
        <div>{text}</div>
      </div>
    </div>
  );
};
