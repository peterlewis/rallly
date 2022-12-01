import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import Head from "next/head";
import superjson from "superjson";

import { prisma } from "~/prisma/db";

import { ParticipantPage } from "../../components/pages/participant-page";
import { PollContext } from "../../components/pages/participant-page/poll-context";
import { withUserSession } from "../../components/user-provider";
import { createContext } from "../../server/context";
import { appRouter } from "../../server/routers/_app";
import { withSessionSsr } from "../../utils/auth";
import { DayjsProvider } from "../../utils/dayjs";
import { trpcNext } from "../../utils/trpc";
import { withPageTranslations } from "../../utils/with-page-translations";

const Page = (props: { pollId: string }) => {
  const { data } = trpcNext.poll.get.useQuery(
    {
      id: props.pollId,
    },
    {
      staleTime: 10000,
    },
  );

  if (!data) {
    // shouldn't happen
    return null;
  }

  return (
    <PollContext.Provider value={data}>
      <DayjsProvider>
        <Head>
          <title>{data.title}</title>
        </Head>
        <ParticipantPage />
      </DayjsProvider>
    </PollContext.Provider>
  );
};

export const getServerSideProps = withSessionSsr(async (ctx) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(ctx as unknown as any), // TODO (Luke Vella) [2022-11-16]: Figure out how to get types to match
    transformer: superjson,
  });

  const res = await withPageTranslations([
    "common",
    "app",
    "errors",
    "timeZones",
  ])(ctx);

  const participantLinkId = ctx.params?.participantLinkId as string;

  const poll = await prisma.poll.findUnique({
    where: {
      participantUrlId: participantLinkId,
    },
    select: {
      id: true,
    },
  });

  if (!poll) {
    return {
      notFound: true,
    };
  }

  await ssg.poll.get.prefetch({
    id: poll.id,
  });

  await ssg.participants.list.prefetch({
    pollId: poll.id,
  });

  await ssg.options.list.prefetch({
    pollId: poll.id,
  });

  await ssg.votes.list.prefetch({
    pollId: poll.id,
  });

  if ("props" in res) {
    return {
      props: {
        ...res.props,
        trpcState: ssg.dehydrate(),
        pollId: poll.id,
      },
    };
  } else {
    return res;
  }
});

export default withUserSession(Page);
