import "react-big-calendar/lib/css/react-big-calendar.css";
import "tailwindcss/tailwind.css";
import "~/style.css";

import { NextPage } from "next";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import PlausibleProvider from "next-plausible";
import { Toaster } from "react-hot-toast";

import Maintenance from "@/components/maintenance";

import { trpcNext } from "../utils/trpc";

const CrispChat = dynamic(() => import("@/components/crisp-chat"), {
  ssr: false,
});

const MyApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1") {
    return <Maintenance />;
  }
  return (
    <PlausibleProvider
      domain="rallly.co"
      customDomain={process.env.PLAUSIBLE_DOMAIN}
      trackOutboundLinks={true}
      selfHosted={true}
      enabled={!!process.env.PLAUSIBLE_DOMAIN}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <CrispChat />
      <Toaster />
      <Component {...pageProps} />
    </PlausibleProvider>
  );
};

export default trpcNext.withTRPC(appWithTranslation(MyApp));
