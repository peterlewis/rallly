import Link, { LinkProps } from "next/link";

export const LinkText = ({
  href,
  onClick,
  children,
  className,
  ...forwardProps
}: React.PropsWithChildren<LinkProps & { className?: string }>) => {
  return (
    <Link {...forwardProps} href={href}>
      <a className={className} onClick={onClick}>
        {children}
      </a>
    </Link>
  );
};
