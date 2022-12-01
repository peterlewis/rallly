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

const pollPublicProcedure = publicProcedure.input(
  z.object({ pollId: z.string() }),
);

export const appRouter = mergeRouters(
  legacyRouter.interop(),
  router({
    poll: router({
      get: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
          return await prisma.poll.findUnique({
            where: {
              id: input.id,
            },
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
              participantUrlId: true,
            },
          });
        }),
    }),
    votes: router({
      list: pollPublicProcedure.query(async ({ input }) => {
        return await prisma.vote.findMany({
          where: {
            pollId: input.pollId,
          },
          select: {
            optionId: true,
            participantId: true,
            type: true,
          },
        });
      }),
    }),
    options: router({
      list: pollPublicProcedure.query(async ({ input }) => {
        const options = await prisma.option.findMany({
          where: {
            pollId: input.pollId,
          },
          orderBy: {
            value: "asc",
          },
          select: {
            id: true,
            value: true,
          },
        });

        return options.map((option) => {
          const o = parseValue(option.value);
          const start = o.type === "date" ? o.date : o.start;
          const duration =
            o.type === "date" ? 0 : dayjs(o.end).diff(o.start, "minutes");

          return { start, duration, id: option.id };
        });
      }),
    }),
    participants: router({
      list: pollPublicProcedure.query(async ({ input }) => {
        return await prisma.participant.findMany({
          where: {
            pollId: input.pollId,
          },
          select: {
            id: true,
            userId: true,
            name: true,
            createdAt: true,
          },
        });
      }),
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
          const poll = await prisma.poll.findFirst({
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
      delete: publicProcedure
        .input(
          z.object({
            id: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          await prisma.participant.delete({
            where: {
              id: input.id,
            },
          });
        }),
    }),
    comments: router({
      list: publicProcedure
        .input(
          z.object({
            pollId: z.string(),
          }),
        )
        .query(async ({ input }) => {
          return await prisma.comment.findMany({
            where: {
              pollId: input.pollId,
            },
            select: {
              id: true,
              createdAt: true,
              userId: true,
              content: true,
            },
          });
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;
