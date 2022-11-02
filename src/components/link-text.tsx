import Link, { LinkProps } from "next/link";

export const LinkText = ({
  href,
  onClick,
  children,
  className,
  ...forwardProps
}: React.PropsWithChildren<LinkProps & { className?: string }>) => {
  return (
    (<Link {...forwardProps} href={href} className={className} onClick={onClick}>

      {children}

    </Link>)
  );
};
