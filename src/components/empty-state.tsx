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
    <div className={clsx("flex items-center justify-center ", className)}>
      <div className="text-center font-medium text-gray-500/50">
        <Icon className="mb-2 inline-block h-16" />
        <div>{text}</div>
      </div>
    </div>
  );
};
