import clsx from "clsx";
import React from "react";

import Pencil from "@/components/icons/pencil.svg";

import { Button } from "./button";

interface SectionHeadingProps {
  title: string;
  active?: boolean;
  actions?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const SectionHeading: React.VoidFunctionComponent<SectionHeadingProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">{title}</div>
        {actions}
      </div>
      {subtitle ? <div className="">{subtitle}</div> : null}
    </div>
  );
};

export type SectionProps = React.PropsWithChildren<{
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}>;

export const Section: React.VoidFunctionComponent<SectionProps> = ({
  className,
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className={clsx("", className)}>
      <SectionHeading title={title} subtitle={subtitle} actions={actions} />
      <div className="">{children}</div>
    </div>
  );
};

export const EditableSection: React.VoidFunctionComponent<
  Omit<SectionProps, "children"> & {
    editText: string;
    children: React.ComponentType<{
      isEditing: boolean;
      stopEditing: () => void;
    }>;
  }
> = ({ children: Component, editText, ...props }) => {
  const [isEditing, setEditing] = React.useState(false);
  return (
    <Section
      {...props}
      actions={
        isEditing ? null : (
          <Button
            onClick={() => {
              setEditing(true);
            }}
            icon={<Pencil />}
          >
            {editText}
          </Button>
        )
      }
    >
      <Component
        isEditing={isEditing}
        stopEditing={() => {
          setEditing(false);
        }}
      />
    </Section>
  );
};
