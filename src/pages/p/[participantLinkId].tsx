import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";

import { ParticipantPage } from "../../components/pages/participant-page";
import { withUserSession } from "../../components/user-provider";
import { createContext } from "../../server/context";
import { appRouter } from "../../server/routers/_app";
import { withSessionSsr } from "../../utils/auth";
import { withPageTranslations } from "../../utils/with-page-translations";

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

export default withUserSession(ParticipantPage);
