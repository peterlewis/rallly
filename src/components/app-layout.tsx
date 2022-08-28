import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";

import Adjustments from "@/components/icons/adjustments.svg";
import Cash from "@/components/icons/cash.svg";
import ChevronRight from "@/components/icons/chevron-right.svg";
import Discord from "@/components/icons/discord.svg";
import Github from "@/components/icons/github.svg";
import Login from "@/components/icons/login.svg";
import Logout from "@/components/icons/logout.svg";
import Menu from "@/components/icons/menu.svg";
import Question from "@/components/icons/question-mark-circle.svg";
import Refresh from "@/components/icons/refresh.svg";
import Twitter from "@/components/icons/twitter.svg";
import User from "@/components/icons/user.svg";
import UserCircle from "@/components/icons/user-circle.svg";
import X from "@/components/icons/x.svg";
import Logo from "~/public/logo.svg";

import { DayjsProvider } from "../utils/dayjs";
import { useLoginModal } from "./auth/login-modal";
import Dropdown, { DropdownItem, DropdownProps } from "./dropdown";
import ModalProvider, { useModalContext } from "./modal/modal-provider";
import Popover from "./popover";
import Preferences from "./preferences";
import { IfAuthenticated, IfGuest, useUser } from "./user-provider";

const Footer: React.VoidFunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden h-16 items-center justify-center space-x-6 py-0 px-6 pt-3 pb-6 text-slate-400 md:flex">
      <div>
        <a
          href="https://rallly.co"
          className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
        >
          <Logo className="h-5" />
        </a>
      </div>
      <div className="text-slate-300">&bull;</div>
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
      <div className="text-slate-300">&bull;</div>
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

const NavigationButton = React.forwardRef<
  null,
  React.PropsWithChildren<{
    link?: boolean;
    href?: string;
    className?: string;
    onClick?: React.MouseEventHandler;
  }>
>(function NavigationButton({ href, className, children, onClick }, ref) {
  const Component = href ? "a" : "button";
  return (
    <Component
      ref={ref}
      onClick={onClick}
      href={href}
      type={!href ? "button" : undefined}
      className={clsx(
        "flex items-center whitespace-nowrap rounded-md px-2 py-1 font-medium text-slate-600 transition-colors hover:bg-gray-200 hover:text-slate-600 hover:no-underline active:bg-gray-300",
        className,
      )}
    >
      {children}
    </Component>
  );
});

export const AppLayoutHeading: React.VoidFunctionComponent<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => {
  return (
    <div
      className={clsx(
        "space-y-4 sm:flex sm:items-start sm:justify-between sm:space-y-0 sm:space-x-4",
        className,
      )}
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
  const { user, getAlias } = useUser();
  const { t } = useTranslation(["common", "app"]);
  const modalContext = useModalContext();
  const router = useRouter();
  const { openLoginModal } = useLoginModal();

  if (!user) {
    return null;
  }
  return (
    <Dropdown
      {...forwardProps}
      trigger={
        <NavigationButton>
          <UserCircle className="h-5 opacity-75" />
          <span className="ml-2">{getAlias()}</span>
        </NavigationButton>
      }
    >
      {children}
      <IfAuthenticated>
        <DropdownItem href="/profile" icon={User} label={t("app:profile")} />
        <DropdownItem href="/logout" icon={Logout} label={t("app:logout")} />
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
          icon={Login}
          onClick={openLoginModal}
          label={t("app:login")}
        />
        <DropdownItem
          icon={Refresh}
          label={t("app:forgetMe")}
          onClick={() => {
            modalContext.render({
              title: t("app:areYouSure"),
              description: t("app:endingGuestSessionNotice"),
              onOk: async () => {
                router.replace("/logout");
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

const MobileNavigation: React.VoidFunctionComponent<BreadcrumbsProps> = (
  props,
) => {
  const { t } = useTranslation(["common", "app"]);
  const [visible, setVisible] = React.useState(false);
  const MenuIcon = visible ? X : Menu;
  const { user } = useUser();
  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-white md:hidden">
        <div className="flex items-center justify-between border-b py-2 px-4">
          <Link href="/polls">
            <a>
              <Logo className="h-5 text-primary-500" />
            </a>
          </Link>
          <div className="flex space-x-1">
            <UserDropdown
              key={user.id} // make sure dropdown closes when user changes. There are nicer ways to do this.
              placement="bottom-end"
            />
            <NavigationButton
              onClick={() => {
                setVisible(!visible);
              }}
            >
              <MenuIcon className="h-5" />
            </NavigationButton>
          </div>
        </div>
        <AnimatePresence>
          {visible ? (
            <motion.div
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-12 z-40 h-[calc(100vh-4px)] w-full divide-y overflow-auto bg-white"
            >
              <ul className="space-y-8 p-4">
                <li>
                  <div className="mb-4 text-lg font-semibold text-slate-700">
                    {t("app:preferences")}
                  </div>
                  <Preferences />
                </li>
              </ul>
              <div className="space-y-8 p-4">
                <div className="flex flex-col space-y-4">
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
                </div>
                <div className="flex items-center space-x-6">
                  <a
                    href="https://twitter.com/ralllyco"
                    className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
                  >
                    <Twitter className="h-5" />
                  </a>
                  <a
                    href="https://github.com/lukevella/rallly"
                    className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
                  >
                    <Github className="h-5" />
                  </a>
                  <a
                    href="https://discord.gg/uzg4ZcHbuM"
                    className="text-sm text-slate-400 transition-colors hover:text-primary-500 hover:no-underline"
                  >
                    <Discord className="h-5" />
                  </a>
                </div>
                <a
                  href="https://www.paypal.com/donate/?hosted_button_id=7QXP2CUBLY88E"
                  className="btn-primary flex items-center justify-center"
                >
                  <Cash className="mr-1 inline-block w-5" />
                  <span>{t("app:donate")}</span>
                </a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {/* <div className="no-scrollbar overflow-auto border-b px-3 py-1 md:hidden">
        <Breadcrumbs {...props} />
      </div> */}
    </>
  );
};

const DesktopNavigation: React.VoidFunctionComponent<BreadcrumbsProps> = ({
  title,
  breadcrumbs,
}) => {
  const { t } = useTranslation("app");
  const { user } = useUser();
  const { openLoginModal } = useLoginModal();
  return (
    <div className="sticky left-0 top-0 z-30 hidden h-14 w-full max-w-full justify-between space-x-4 bg-white/75 px-4 backdrop-blur-md md:flex md:items-center">
      <div className="flex items-center space-x-4 overflow-hidden">
        <Link href="/polls">
          <a>
            <Logo className="h-6 text-primary-500" />
          </a>
        </Link>
        <Breadcrumbs title={title} breadcrumbs={breadcrumbs} />
      </div>
      <div className="flex items-center lg:space-x-2">
        <Popover
          placement="bottom-end"
          trigger={
            <NavigationButton>
              <Adjustments className="h-5 opacity-75" />
              <span className="ml-2">{t("preferences")}</span>
            </NavigationButton>
          }
        >
          <Preferences />
        </Popover>
        <IfGuest>
          <Link href="/login" passHref={true}>
            <NavigationButton
              onClick={(e) => {
                e.preventDefault();
                openLoginModal();
              }}
            >
              <Login className="h-5 opacity-75" />
              <span className="ml-2">{t("login")}</span>
            </NavigationButton>
          </Link>
        </IfGuest>
        <UserDropdown
          key={user.id} // make sure dropdown closes when user changes. There are nicer ways to do this.
          placement="bottom-end"
        />
      </div>
    </div>
  );
};

interface BreadcrumbsProps {
  title: React.ReactNode;
  breadcrumbs?: Array<{ title: React.ReactNode; href: string }>;
}

const Breadcrumbs: React.VoidFunctionComponent<BreadcrumbsProps> = ({
  title,
  breadcrumbs,
}) => {
  return (
    <div className="flex items-center space-x-1 whitespace-nowrap py-1 md:flex md:overflow-hidden md:rounded-lg md:bg-slate-500/10 md:px-3">
      {breadcrumbs?.map((breadcrumb, i) => (
        <div className="flex shrink-0 items-center" key={i}>
          <Link href={breadcrumb.href}>
            <a className="mr-1 inline-block text-gray-500 hover:text-gray-600 hover:no-underline">
              {breadcrumb.title}
            </a>
          </Link>
          <ChevronRight className="inline-block h-5 shrink-0 text-gray-400" />
        </div>
      ))}
      <div className="shrink font-medium md:truncate">{title}</div>
    </div>
  );
};

export const AppLayout: React.VFC<{
  children?: React.ReactNode;
  title: React.ReactNode;
  breadcrumbs?: Array<{ title: React.ReactNode; href: string }>;
}> = ({ title, breadcrumbs, children }) => {
  return (
    <DayjsProvider>
      <ModalProvider>
        <div className="relative max-w-full md:h-full">
          <div className="md:min-h-[calc(100vh-64px)]">
            <Head>
              <title>{title}</title>
            </Head>
            <MobileNavigation title={title} breadcrumbs={breadcrumbs} />
            <DesktopNavigation title={title} breadcrumbs={breadcrumbs} />
            <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
          </div>
          <Footer />
        </div>
      </ModalProvider>
    </DayjsProvider>
  );
};
