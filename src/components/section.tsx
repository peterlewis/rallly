import clsx from "clsx";

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

type SectionProps = React.PropsWithChildren<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  bordered?: boolean;
  actions?: React.ReactNode;
  className?: string;
}>;

export const Section: React.VoidFunctionComponent<SectionProps> = ({
  bordered,
  className,
  title,
  icon,
  actions,
  children,
}) => {
  return (
    <div className={clsx("py-4", className)}>
      <SectionHeading title={title} icon={icon} actions={actions} />
      {children}
    </div>
  );
};
