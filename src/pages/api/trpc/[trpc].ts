import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";

import { createContext } from "../../../server/context";
import { createRouter } from "../../../server/createRouter";
import { auth } from "../../../server/routers/auth";
import { polls } from "../../../server/routers/polls";
import { user } from "../../../server/routers/user";
import { withSessionRoute } from "../../../utils/auth";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("polls.", polls)
  .merge("auth.", auth)
  .merge("user.", user);

// export type definition of API
export type AppRouter = typeof appRouter;

export const config = {
  api: {
    externalResolver: true,
  },
};
// export API handler
export default withSessionRoute(
  trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
  }),
);
