import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import { parseValue } from "../../utils/date-time-utils";
import { createRouter } from "../createRouter";
import { mergeRouters, publicProcedure, router } from "../trpc";
import { auth } from "./auth";
import { polls } from "./polls";
import { user } from "./user";

const legacyRouter = createRouter()
  .merge("polls.", polls)
  .merge("auth.", auth)
  .merge("user.", user);

export const appRouter = mergeRouters(
  legacyRouter.interop(),
  router({
    poll: router({
      getByParticipantLinkId: publicProcedure
        .input(
          z.object({
            id: z.string(),
          }),
        )
        .query(async ({ input }) => {
          const poll = await prisma.poll.findUnique({
            select: {
              title: true,
              description: true,
              createdAt: true,
              timeZone: true,
              location: true,
              user: {
                select: {
                  name: true,
                },
              },
              options: {
                orderBy: {
                  value: "asc",
                },
              },
            },
            where: {
              participantUrlId: input.id,
            },
          });

          if (!poll) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          return {
            ...poll,
            options: poll.options.map((option) => {
              const o = parseValue(option.value);
              const start = o.type === "date" ? o.date : o.start;
              const duration =
                o.type === "date" ? 0 : dayjs(o.end).diff(o.start, "minutes");

              return { start, duration, id: option.id };
            }),
          };
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;
