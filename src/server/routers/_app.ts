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
        .query(async ({ input, ctx }) => {
          const poll = await prisma.poll.findUnique({
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              timeZone: true,
              location: true,
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
              options: {
                orderBy: {
                  value: "asc",
                },
                select: {
                  id: true,
                  value: true,
                },
              },
              participants: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  votes: {
                    select: {
                      optionId: true,
                      type: true,
                    },
                  },
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
    participant: router({
      add: publicProcedure
        .input(
          z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            votes: z.array(
              z.object({
                optionId: z.string(),
                vote: z.enum(["yes", "ifNeedBe", "no"]),
              }),
            ),
          }),
        )
        .use(async ({ input, next }) => {
          const poll = await prisma.poll.findUnique({
            where: {
              id: input.id,
            },
          });
          if (!poll) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }
          return next();
        })
        .mutation(async ({ ctx, input }) => {
          const participant = await prisma.participant.create({
            data: {
              pollId: input.id,
              name: input.name,
              userId: ctx.user.id,
              votes: {
                createMany: {
                  data: input.votes.map(({ optionId, vote }) => ({
                    optionId,
                    type: vote,
                    pollId: input.id,
                  })),
                },
              },
            },
            include: {
              votes: true,
            },
          });

          return participant;
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;
