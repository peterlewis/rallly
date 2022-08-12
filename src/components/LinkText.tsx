import Link, { LinkProps } from "next/link";

export const LinkText = ({
  href,
  onClick,
  children,
  ...forwardProps
}: React.PropsWithChildren<LinkProps>) => {
  return (
    <Link {...forwardProps} href={href}>
      <a onClick={onClick}>{children}</a>
    </Link>
  );
};
