import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import { nanoid } from "../../utils/nanoid";
import { GetPollApiResponse } from "../../utils/trpc/types";
import { createRouter } from "../createRouter";
import { mergeRouters, publicProcedure, router } from "../trpc";
import { comments } from "./polls/comments";
import { demo } from "./polls/demo";
import { participants } from "./polls/participants";

const defaultSelectFields: {
  id: true;
  timeZone: true;
  title: true;
  location: true;
  description: true;
  createdAt: true;
  participantUrlId: true;
  adminUrlId: true;
  userId: true;
  closed: true;
  legacy: true;
  demo: true;
  notifications: true;
  deleted: true;
  options: {
    orderBy: {
      value: "asc";
    };
  };
  user: true;
} = {
  id: true,
  timeZone: true,
  userId: true,
  deleted: true,
  title: true,
  location: true,
  description: true,
  createdAt: true,
  participantUrlId: true,
  adminUrlId: true,
  closed: true,
  legacy: true,
  notifications: true,
  demo: true,
  options: {
    orderBy: {
      value: "asc",
    },
  },
  user: true,
};

const getPollIdFromAdminUrlId = async (urlId: string) => {
  const res = await prisma.poll.findUnique({
    select: {
      id: true,
    },
    where: { adminUrlId: urlId },
  });

  if (!res) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }
  return res.id;
};

const legacyPolls = createRouter()
  .mutation("create", {
    input: z.object({
      title: z.string(),
      timeZone: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      options: z.string().array(),
      demo: z.boolean().optional(),
    }),
    resolve: async ({ ctx, input }): Promise<{ urlId: string }> => {
      const adminUrlId = await nanoid();
      const id = await nanoid();
      await prisma.poll.create({
        data: {
          id,
          title: input.title,
          type: "date",
          timeZone: input.timeZone,
          location: input.location,
          description: input.description,
          demo: input.demo,
          adminUrlId,
          participantUrlId: await nanoid(),
          userId: ctx.user.id,
          options: {
            createMany: {
              data: input.options.map((value) => ({
                value,
              })),
            },
          },
        },
      });

      return { urlId: id };
    },
  })
  .query("list", {
    resolve: async ({ ctx }) => {
      const polls = await prisma.poll.findMany({
        select: {
          title: true,
          id: true,
          adminUrlId: true,
          createdAt: true,
          type: true,
          closed: true,
          location: true,
          updatedAt: true,
          notifications: true,
          participants: {
            select: {
              name: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        where: {
          userId: ctx.user.id,
          deleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return polls;
    },
  })
  .query("get", {
    input: z.object({
      urlId: z.string(),
    }),
    resolve: async ({ input, ctx }): Promise<GetPollApiResponse> => {
      const poll = await prisma.poll.findFirst({
        select: defaultSelectFields,
        where: {
          id: input.urlId,
        },
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (poll.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return poll;
    },
  })
  .mutation("updateDescription", {
    input: z.object({
      urlId: z.string(),
      description: z.union([z.string(), z.null()]),
    }),
    resolve: async ({ input }) => {
      await prisma.poll.update({
        where: {
          adminUrlId: input.urlId,
        },
        data: {
          description: input.description,
        },
      });

      return { description: input.description };
    },
  })
  .mutation("updateLocation", {
    input: z.object({
      urlId: z.string(),
      location: z.union([z.string(), z.null()]),
    }),
    resolve: async ({ input }) => {
      await prisma.poll.update({
        where: {
          adminUrlId: input.urlId,
        },
        data: {
          location: input.location,
        },
      });

      return { location: input.location };
    },
  })
  .mutation("updateTitle", {
    input: z.object({
      urlId: z.string(),
      title: z.string(),
    }),
    resolve: async ({ input }) => {
      await prisma.poll.update({
        where: {
          adminUrlId: input.urlId,
        },
        data: {
          title: input.title,
        },
      });

      return { title: input.title };
    },
  })
  .mutation("updateNotifications", {
    input: z.object({
      enabled: z.boolean(),
      urlId: z.string(),
    }),
    resolve: async ({ input }) => {
      await prisma.poll.update({
        where: {
          id: input.urlId,
        },
        data: {
          notifications: input.enabled,
        },
      });
    },
  })
  .mutation("update", {
    input: z.object({
      urlId: z.string(),
      title: z.string().optional(),
      timeZone: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      optionsToDelete: z.string().array().optional(),
      optionsToAdd: z.string().array().optional(),
      notifications: z.boolean().optional(),
      closed: z.boolean().optional(),
    }),
    resolve: async ({ input }): Promise<GetPollApiResponse> => {
      const pollId = await getPollIdFromAdminUrlId(input.urlId);

      if (input.optionsToDelete && input.optionsToDelete.length > 0) {
        await prisma.option.deleteMany({
          where: {
            pollId,
            id: {
              in: input.optionsToDelete,
            },
          },
        });
      }

      if (input.optionsToAdd && input.optionsToAdd.length > 0) {
        await prisma.option.createMany({
          data: input.optionsToAdd.map((optionValue) => ({
            value: optionValue,
            pollId,
          })),
        });
      }

      const poll = await prisma.poll.update({
        select: defaultSelectFields,
        where: {
          id: pollId,
        },
        data: {
          title: input.title,
          location: input.location,
          description: input.description,
          timeZone: input.timeZone,
          notifications: input.notifications,
          closed: input.closed,
        },
      });

      return poll;
    },
  })
  .mutation("delete", {
    input: z.object({
      urlId: z.string(),
    }),
    resolve: async ({ input: { urlId } }) => {
      const pollId = await getPollIdFromAdminUrlId(urlId);
      await prisma.poll.delete({ where: { id: pollId } });
    },
  })
  .mutation("touch", {
    input: z.object({
      pollId: z.string(),
    }),
    resolve: async ({ input: { pollId } }) => {
      await prisma.poll.update({
        where: {
          id: pollId,
        },
        data: {
          touchedAt: new Date(),
        },
      });
    },
  })
  .mutation("claim", {
    input: z.object({
      adminUrlId: z.string(),
    }),
    resolve: async ({ ctx, input }): Promise<GetPollApiResponse> => {
      const poll = await prisma.poll.findUnique({
        select: {
          user: true,
        },
        where: {
          adminUrlId: input.adminUrlId,
        },
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (poll.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This poll is already claimed.",
        });
      }

      const claimedPoll = await prisma.poll.update({
        select: defaultSelectFields,
        where: {
          adminUrlId: input.adminUrlId,
        },
        data: {
          userId: ctx.user.id,
        },
      });

      return claimedPoll;
    },
  })
  .interop();

export const polls = mergeRouters(
  router({
    demo,
    participants,
    comments,
  }),
  legacyPolls,
);
