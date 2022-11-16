import { MutationCache } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { createReactQueryHooks } from "@trpc/react-query";
import toast from "react-hot-toast";

import { AppRouter } from "../server/routers/_app";

export const trpc = createReactQueryHooks<AppRouter>();

export const trpcNext = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `/api/trpc`,
        }),
      ],
      queryClientConfig: {
        mutationCache: new MutationCache({
          onError: () => {
            toast.error(
              "Uh oh! Something went wrong. The issue has been logged and we'll fix it as soon as possible. Please try again later.",
            );
          },
        }),
      },
    };
  },
  ssr: false,
});
