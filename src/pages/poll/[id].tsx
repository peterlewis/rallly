import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";

import { withUserSession } from "@/components/user-provider";
import { withSessionSsr } from "@/utils/auth";
import { DayjsProvider } from "@/utils/dayjs";
import { withPageTranslations } from "@/utils/with-page-translations";

import { PollContext } from "../../components/pages/participant-page/poll-context";
import { Dashbaord } from "../../components/pages/poll/dashboard";
import { createContext } from "../../server/context";
import { appRouter } from "../../server/routers/_app";
import { trpcNext } from "../../utils/trpc";

const Page = (props: { pollId: string }) => {
  const { data } = trpcNext.poll.get.useQuery({ id: props.pollId });

  if (!data) {
    return null;
  }

  return (
    <PollContext.Provider value={data}>
      <DayjsProvider>
        <Dashbaord />
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

  const pollId = ctx.params?.id as string;

  const poll = await ssg.poll.get.fetch({
    id: pollId,
  });

  if (!poll) {
    return { notFound: true };
  }

  await ssg.participants.list.prefetch({
    pollId,
  });

  await ssg.options.list.prefetch({
    pollId,
  });

  await ssg.votes.list.prefetch({
    pollId,
  });

  if ("props" in res) {
    return {
      props: {
        ...res.props,
        trpcState: ssg.dehydrate(),
        pollId,
      },
    };
  } else {
    return res;
  }
});

export default withUserSession(Page);
