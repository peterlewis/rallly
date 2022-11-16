import { createRouter } from "../createRouter";
import { auth } from "./auth";
import { polls } from "./polls";
import { user } from "./user";

const legacyRouter = createRouter()
  .merge("polls.", polls)
  .merge("auth.", auth)
  .merge("user.", user);

export const appRouter = legacyRouter.interop();

export type AppRouter = typeof appRouter;
