import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import Trash from "@/components/icons/trash.svg";
import { getBrowserTimeZone } from "@/utils/date-time-utils";
import { GetPollApiResponse } from "@/utils/trpc/types";

import Custom404 from "../pages/404";
import { trpc } from "../utils/trpc";
import ErrorPage from "./error-page";
import FullPageLoader from "./full-page-loader";
import { PollViewOption } from "./poll/types";
import { useRequiredContext } from "./use-required-context";

type PollContextValue = {
  poll: GetPollApiResponse;
  options: PollViewOption[];
  updatePoll: (poll: GetPollApiResponse) => void;
  urlId: string;
  targetTimeZone: string;
  setTargetTimeZone: (timeZone: string) => void;
};

export const PollContext = React.createContext<PollContextValue | null>(null);

PollContext.displayName = "PollContext.Provider";

export const usePoll = () => {
  const context = useRequiredContext(PollContext);
  return context;
};

export const PollContextProvider: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation("app");
  const { query, asPath } = useRouter();
  const urlId = query.urlId as string;
  const [notFound, setNotFound] = React.useState(false);

  const admin = /^\/admin/.test(asPath);

  const queryClient = trpc.useContext();
  const pollQuery = trpc.useQuery(["polls.get", { urlId, admin }], {
    onError: () => {
      setNotFound(true);
    },
    retry: false,
  });

  const poll = pollQuery.data;

  const [targetTimeZone, setTargetTimeZone] =
    React.useState(getBrowserTimeZone);

  if (notFound) {
    return <Custom404 />;
  }

  if (!poll) {
    return <FullPageLoader>{t("loading")}</FullPageLoader>;
  }

  if (poll.deleted) {
    return (
      <ErrorPage
        icon={Trash}
        title={t("deletedPoll")}
        description={t("deletedPollInfo")}
      />
    );
  }

  return (
    <PollContext.Provider
      value={{
        poll,
        urlId,
        updatePoll: (newPoll) => {
          queryClient.setQueryData(["polls.get", { urlId, admin }], newPoll);
        },
        targetTimeZone,
        setTargetTimeZone,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};
