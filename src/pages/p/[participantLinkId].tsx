import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import groupBy from "lodash/groupBy";
import Head from "next/head";
import { useRouter } from "next/router";
import superjson from "superjson";

import { ParticipantPage } from "../../components/pages/participant-page";
import {
  OptionsContext,
  PollContext,
} from "../../components/pages/participant-page/poll-context";
import { withUserSession } from "../../components/user-provider";
import { createContext } from "../../server/context";
import { appRouter } from "../../server/routers/_app";
import { withSessionSsr } from "../../utils/auth";
import { DayjsProvider } from "../../utils/dayjs";
import { trpcNext } from "../../utils/trpc";
import { withPageTranslations } from "../../utils/with-page-translations";

const Page = () => {
  const router = useRouter();
  const { data } = trpcNext.poll.getByParticipantLinkId.useQuery(
    {
      id: router.query.participantLinkId as string,
    },
    {
      staleTime: 10000,
    },
  );

  if (!data) {
    // shouldn't happen
    return null;
  }

  const voteByOptionId = groupBy(data.votes, "optionId");

  return (
    <PollContext.Provider value={data}>
      <OptionsContext.Provider
        value={{
          options: data.options.reduce((optionsById, option) => {
            optionsById[option.id] = {
              ...option,
              score: voteByOptionId[option.id].reduce((score, vote) => {
                if (vote.type === "yes") {
                  return score + 1;
                }
                return score;
              }, 0),
            };
            return optionsById;
          }, {}),
        }}
      >
        <DayjsProvider>
          <Head>
            <title>{data.title}</title>
          </Head>
          <ParticipantPage />
        </DayjsProvider>
      </OptionsContext.Provider>
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
  await ssg.poll.getByParticipantLinkId.prefetch({
    id: participantLinkId,
  });

  if ("props" in res) {
    return {
      props: {
        ...res.props,
        trpcState: ssg.dehydrate(),
        participantLinkId,
      },
    };
  } else {
    return res;
  }
});

export default withUserSession(Page);
