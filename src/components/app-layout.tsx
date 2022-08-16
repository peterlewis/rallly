import clsx from "clsx";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import * as React from "react";

import Adjustments from "@/components/icons/adjustments.svg";
import ChevronRight from "@/components/icons/chevron-right.svg";
import Login from "@/components/icons/login.svg";
import Logout from "@/components/icons/logout.svg";
import Question from "@/components/icons/question-mark-circle.svg";
import Refresh from "@/components/icons/refresh.svg";
import User from "@/components/icons/user.svg";
import UserCircle from "@/components/icons/user-circle.svg";
import Logo from "~/public/logo.svg";

import { DayjsProvider } from "../utils/dayjs";
import Dropdown, { DropdownItem, DropdownProps } from "./dropdown";
import Cash from "./icons/cash.svg";
import Discord from "./icons/discord.svg";
import Github from "./icons/github.svg";
import Twitter from "./icons/twitter.svg";
import ModalProvider, { useModalContext } from "./modal/modal-provider";
import Popover from "./popover";
import Preferences from "./preferences";
import { IfAuthenticated, IfGuest, useUser } from "./user-provider";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 px-6 pt-3 pb-6 text-slate-400 md:h-16 md:flex-row md:space-y-0 md:space-x-6 md:py-0 md:px-8 md:pb-3">
      <div>
        <Link href="https://rallly.co">
          <a className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline">
            <Logo className="h-5" />
          </a>
        </Link>
      </div>
      <div className="hidden text-slate-300 md:block">&bull;</div>
      <div className="flex items-center justify-center space-x-6 md:justify-start">
        <a
          target="_blank"
          href="https://support.rallly.co"
          className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
          rel="noreferrer"
        >
          {t("common:support")}
        </a>
        <Link href="https://github.com/lukevella/rallly/discussions">
          <a className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline">
            {t("common:discussions")}
          </a>
        </Link>
        <Link href="https://blog.rallly.co">
          <a className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline">
            {t("common:blog")}
          </a>
        </Link>
        <div className="hidden text-slate-300 md:block">&bull;</div>
        <div className="flex items-center space-x-6">
          <a
            href="https://twitter.com/ralllyco"
            className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/lukevella/rallly"
            className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://discord.gg/uzg4ZcHbuM"
            className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
          >
            <Discord className="h-5 w-5" />
          </a>
        </div>
      </div>
      <div className="hidden text-slate-300 md:block">&bull;</div>
      <a
        href="https://www.paypal.com/donate/?hosted_button_id=7QXP2CUBLY88E"
        className="inline-flex h-8 items-center rounded-full bg-slate-100 pl-2 pr-3 text-sm text-slate-400 transition-colors hover:bg-primary-500 hover:text-white hover:no-underline focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 active:bg-primary-600"
      >
        <Cash className="mr-1 inline-block w-5" />
        <span>{t("app:donate")}</span>
      </a>
    </div>
  );
};

export const AppLayoutHeading: React.VoidFunctionComponent<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => {
  return (
    <div
      className={clsx("flex items-start justify-between space-x-4", className)}
    >
      <div className="grow">
        <div
          className="mb-1 text-2xl font-semibold text-slate-700 md:text-left md:text-3xl"
          data-testid="poll-title"
        >
          {title}
        </div>
        {description ? (
          <div className="text-slate-500/75 lg:text-lg">{description}</div>
        ) : null}
      </div>
      {actions}
    </div>
  );
};

const UserDropdown: React.VoidFunctionComponent<DropdownProps> = ({
  children,
  ...forwardProps
}) => {
  const { user, reset } = useUser();
  const { t } = useTranslation(["common", "app"]);
  const modalContext = useModalContext();
  if (!user) {
    return null;
  }
  return (
    <Dropdown {...forwardProps}>
      {children}
      <IfAuthenticated>
        <DropdownItem href="/profile" icon={User} label={t("app:profile")} />
        <DropdownItem
          href="/logout"
          onClick={async (e) => {
            e.preventDefault();
            await reset();
          }}
          icon={Logout}
          label={t("app:logout")}
        />
      </IfAuthenticated>
      <IfGuest>
        <DropdownItem
          icon={Question}
          label={t("app:whatsThis")}
          onClick={() => {
            modalContext.render({
              showClose: true,
              content: (
                <div className="w-96 max-w-full p-6 pt-28">
                  <div className="absolute left-0 -top-8 w-full text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-gradient-to-b from-purple-400 to-primary-500">
                      <User className="h-7 text-white" />
                    </div>
                    <div className="">
                      <div className="text-lg font-medium leading-snug">
                        {t("app:guest")}
                      </div>
                      <div className="text-sm text-slate-500">{user.id}</div>
                    </div>
                  </div>
                  <p>{t("app:guestSessionNotice")}</p>
                  <div>
                    <a
                      href="https://support.rallly.co/guest-sessions"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("app:guestSessionReadMore")}
                    </a>
                  </div>
                </div>
              ),
              overlayClosable: true,
              footer: null,
            });
          }}
        />
        <DropdownItem
          icon={Refresh}
          label={t("app:forgetMe")}
          onClick={() => {
            modalContext.render({
              title: t("app:areYouSure"),
              description: t("app:endingGuestSessionNotice"),
              onOk: async () => {
                await reset();
              },
              okButtonProps: {
                type: "danger",
              },
              okText: t("app:endSession"),
              cancelText: t("app:cancel"),
            });
          }}
        />
      </IfGuest>
    </Dropdown>
  );
};

const Breadcrumbs: React.VoidFunctionComponent<{
  title: React.ReactNode;
  breadcrumbs?: Array<{ title: React.ReactNode; href: string }>;
}> = ({ title, breadcrumbs }) => {
  return (
    <div className="flex items-center space-x-1 overflow-hidden rounded-lg bg-slate-500/10 py-1 px-3">
      {breadcrumbs?.map((breadcrumb, i) => (
        <div className="flex shrink-0 items-center" key={i}>
          <Link href={breadcrumb.href}>
            <a className="mr-1 inline-block text-gray-500 hover:text-gray-600">
              {breadcrumb.title}
            </a>
          </Link>
          <ChevronRight className="inline-block h-5 text-gray-400" />
        </div>
      ))}
      <div className="shrink truncate font-medium">{title}</div>
    </div>
  );
};

export const AppLayout: React.VFC<{
  children?: React.ReactNode;
  title: React.ReactNode;
  breadcrumbs?: Array<{ title: React.ReactNode; href: string }>;
}> = ({ title, breadcrumbs, children }) => {
  const { t } = useTranslation("app");
  const { user } = useUser();
  const getName = () => {
    if (!user.isGuest) {
      return user.name;
    }

    const [, id] = user.id.split("-");

    return `${t("guest")}-${id.substring(0, 4)}`;
  };
  return (
    <DayjsProvider>
      <ModalProvider>
        <div className="h-full max-w-full overflow-x-hidden overflow-y-scroll">
          <div className="flex md:min-h-[calc(100vh-64px)]">
            <div className="max-w-full grow p-4 lg:px-6">
              <Head>
                <title>{title}</title>
              </Head>
              <div className="mb-4 flex w-full max-w-full items-center justify-between">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <Link href="/">
                    <a>
                      <Logo className="h-6 text-primary-500" />
                    </a>
                  </Link>
                  <Breadcrumbs title={title} breadcrumbs={breadcrumbs} />
                </div>
                <div className="hidden items-center md:flex lg:space-x-2">
                  <Popover
                    placement="bottom-end"
                    trigger={
                      <button
                        type="button"
                        className="flex items-center whitespace-nowrap rounded-md px-2 py-1 font-medium text-slate-600 transition-colors hover:bg-gray-200 hover:text-slate-600 hover:no-underline active:bg-gray-300"
                      >
                        <Adjustments className="h-5 opacity-75" />
                        <span className="ml-2">{t("preferences")}</span>
                      </button>
                    }
                  >
                    <Preferences />
                  </Popover>
                  <IfGuest>
                    <Link href="/login">
                      <a className="flex w-full items-center space-x-2 whitespace-nowrap rounded-md px-2 py-1 font-medium text-slate-600 transition-colors hover:bg-gray-200 hover:text-slate-600 hover:no-underline active:bg-gray-300">
                        <Login className="h-5 opacity-75" />
                        <span className="ml-2">{t("login")}</span>
                      </a>
                    </Link>
                  </IfGuest>
                  <UserDropdown
                    key={user.id} // make sure dropdown closes when user changes. There are nicer ways to do this.
                    placement="bottom-end"
                    trigger={
                      <button
                        type="button"
                        className="flex items-center whitespace-nowrap rounded-md px-2 py-1 font-medium text-slate-600 transition-colors hover:bg-gray-200 hover:text-slate-600 hover:no-underline active:bg-gray-300"
                      >
                        <UserCircle className="h-5 opacity-75" />
                        <span className="ml-2">{getName()}</span>
                      </button>
                    }
                  ></UserDropdown>
                </div>
              </div>
              <div className="mx-auto mt-8 max-w-4xl">{children}</div>
            </div>
          </div>
          <Footer />
        </div>
      </ModalProvider>
    </DayjsProvider>
  );
};
