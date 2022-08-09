import clsx from "clsx";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";

import Folder from "@/components/icons/calendar.svg";
import ChevronRight from "@/components/icons/chevron-right.svg";
import Logout from "@/components/icons/logout.svg";
import Logo from "~/public/logo.svg";

import { DayjsProvider } from "../utils/dayjs";
import ModalProvider from "./modal/modal-provider";
import { useUser } from "./user-provider";

const NavigationItem: React.VoidFunctionComponent<{
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ href, children, icon: Icon }) => {
  const router = useRouter();
  const regex = new RegExp(`^${href}`);
  const selected = regex.test(router.asPath);
  return (
    <Link href={href}>
      <a
        className={clsx(
          "transition-color flex items-center rounded-md px-4 py-2",
          {
            "pointer-events-none bg-slate-300/30 text-slate-700": selected,
            "text-slate-500 hover:text-primary-500": !selected,
          },
        )}
      >
        <Icon className="mr-2 h-5" />
        {children}
      </a>
    </Link>
  );
};

export const AppPage: React.VFC<{
  children?: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ title: React.ReactNode; href: string }>;
}> = ({ children, title, actions, breadcrumbs }) => {
  return (
    <div className="px-8 pb-6">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex h-16 w-full items-center justify-between">
        <div className="flex items-center space-x-1">
          {breadcrumbs?.map((breadcrumb, i) => (
            <span key={i}>
              <Link href={breadcrumb.href}>
                <a className="mr-1 h-9 py-1 text-gray-500 hover:text-gray-600">
                  {breadcrumb.title}
                </a>
              </Link>
              <span className="text-gray-400">
                <ChevronRight className="inline-block h-5" />
              </span>
            </span>
          ))}
          <span className="font-medium">{title}</span>
        </div>
        {actions}
      </div>
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  );
};

export const AppLayout: React.VFC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user } = useUser();
  const { t } = useTranslation("app");
  return (
    <DayjsProvider>
      <ModalProvider>
        <div className="flex h-full min-w-fit">
          <div className="flex w-64 shrink-0 flex-col bg-slate-300/20">
            <div className="grow">
              <div className="py-6 px-8">
                <Link href="/">
                  <a>
                    <Logo className="h-6 text-primary-500" />
                  </a>
                </Link>
              </div>
              <div className="p-4">
                <div>
                  <NavigationItem icon={Folder} href="/polls">
                    {t("meetingPolls")}
                  </NavigationItem>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between space-x-3 rounded-lg p-6">
              <div className="flex min-w-0 items-center space-x-3">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold uppercase text-cyan-100">
                  {user.id[0]}
                </div>
                {user.isGuest ? (
                  <div></div>
                ) : (
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <Link href="/logout">
                  <a className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200 hover:text-primary-600">
                    <Logout className="h-5" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <div className="grow overflow-y-scroll bg-white">{children}</div>
        </div>
      </ModalProvider>
    </DayjsProvider>
  );
};
