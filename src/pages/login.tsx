import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import FullPageLoader from "@/components/full-page-loader";

import { trpcNext } from "../utils/trpc";

const Page: NextPage = () => {
  const { query } = useRouter();

  const queryClient = trpcNext.useContext();

  const authenticate = trpcNext.whoami.auth.useMutation({
    onSuccess: () => {
      queryClient.whoami.get.invalidate();
    },
  });

  React.useEffect(() => {
    authenticate.mutate({ code: query.code as string });
  }, [authenticate, query.code]);

  return (
    <>
      <Head>
        <title>Logging in…</title>
      </Head>
      <FullPageLoader>Logging in…</FullPageLoader>
    </>
  );
};

export default Page;
