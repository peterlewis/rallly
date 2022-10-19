import clsx from "clsx";
import React from "react";

import Pencil from "@/components/icons/pencil.svg";

import { Button } from "./button";

interface SectionHeadingProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  actions?: React.ReactNode;
}

const SectionHeading: React.VoidFunctionComponent<SectionHeadingProps> = ({
  title,
  icon: Icon,
  actions,
}) => {
  return (
    <div className="mb-2 flex h-9 items-start justify-between">
      <div className="inline-flex items-center gap-2 text-lg text-primary-500">
        <Icon className="h-6" />
        {title}
      </div>
      {actions}
    </div>
  );
};

export type SectionProps = React.PropsWithChildren<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}>;

export const Section: React.VoidFunctionComponent<SectionProps> = ({
  className,
  title,
  icon,
  actions,
  children,
}) => {
  return (
    <div className={clsx(className)}>
      <SectionHeading title={title} icon={icon} actions={actions} />
      {children}
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
