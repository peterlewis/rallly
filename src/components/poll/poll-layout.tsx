import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { usePoll } from "../poll-provider";

const MenuItem: React.VoidFunctionComponent<{
  href: string;
  children?: React.ReactNode;
}> = ({ href, children }) => {
  const router = useRouter();
  return (
    <Link
      className={clsx("btn-default", {
        "ring-2 ring-slate-200": router.asPath === href,
      })}
      href={href}
    >
      {children}
    </Link>
  );
};

export const PollLayout: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const { poll } = usePoll();
  return (
    <div className="">
      <div className="mb-4 text-2xl font-semibold">{poll.title}</div>
      <div className="action-group mb-4">
        <MenuItem href={`/poll/${poll.id}`}>Dashboard</MenuItem>
        <MenuItem href={`/poll/${poll.id}/manage`}>Manage</MenuItem>
      </div>
      <div>{children}</div>
    </div>
  );
};
