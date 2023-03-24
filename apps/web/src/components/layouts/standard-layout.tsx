import { domMax, LazyMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";

import { DayjsProvider } from "@/utils/dayjs";

import { NextPageWithLayout } from "../../types";
import ModalProvider from "../modal/modal-provider";
import { UserProvider } from "../user-provider";
import { MobileNavigation } from "./standard-layout/mobile-navigation";

const Feedback = dynamic(() => import("../feedback"), { ssr: false });

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
  ? `v${process.env.NEXT_PUBLIC_APP_VERSION}`
  : null;

const AppVersion = () => {
  if (!appVersion) return null;

  const href = appVersion
    ? `https://github.com/lukevella/rallly/releases/tag/${appVersion}`
    : "https://github.com/lukevella/rallly/releases";
  return (
    <Link
      href={href}
      className="fixed bottom-0 left-0 hidden rounded-none rounded-tr px-2 py-1 text-xs text-slate-400 lg:block"
    >
      {appVersion}
    </Link>
  );
};

const StandardLayout: React.FunctionComponent<{
  children?: React.ReactNode;
}> = ({ children, ...rest }) => {
  return (
    <LazyMotion features={domMax}>
      <UserProvider>
        <DayjsProvider>
          <ModalProvider>
            <div className="bg-pattern relative min-h-full" {...rest}>
              {process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ? <Feedback /> : null}
              <MobileNavigation />
              <div className="mx-auto max-w-4xl grow">{children}</div>
              <AppVersion />
            </div>
          </ModalProvider>
        </DayjsProvider>
      </UserProvider>
    </LazyMotion>
  );
};

export default StandardLayout;

export const getStandardLayout: NextPageWithLayout["getLayout"] =
  function getLayout(page) {
    return <StandardLayout>{page}</StandardLayout>;
  };
