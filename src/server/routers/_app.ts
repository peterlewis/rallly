import { router } from "../trpc";
import { auth } from "./auth";
import { polls } from "./polls";
import { user } from "./user";

export const appRouter = router({
  polls,
  auth,
  user,
});

export type AppRouter = typeof appRouter;
