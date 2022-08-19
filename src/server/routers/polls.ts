import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import { absoluteUrl } from "../../utils/absolute-url";
import { sendEmailTemplate } from "../../utils/api-utils";
import { nanoid } from "../../utils/nanoid";
import { GetPollApiResponse } from "../../utils/trpc/types";
import { createRouter } from "../createRouter";
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

export const polls = createRouter()
  .merge("demo.", demo)
  .merge("participants.", participants)
  .merge("comments.", comments)
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

      const poll = await prisma.poll.create({
        data: {
          id: await nanoid(),
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

      const homePageUrl = absoluteUrl();
      const pollUrl = `${homePageUrl}/admin/${adminUrlId}`;

      try {
        if (!ctx.user.isGuest) {
          await sendEmailTemplate({
            templateName: "new-poll-verified",
            to: ctx.user.email,
            subject: `Rallly: ${poll.title}`,
            templateVars: {
              title: poll.title,
              name: ctx.user.name,
              pollUrl,
              homePageUrl,
              supportEmail: process.env.SUPPORT_EMAIL,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }

      return { urlId: adminUrlId };
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
      admin: z.boolean(),
    }),
    resolve: async ({ input, ctx }): Promise<GetPollApiResponse> => {
      const poll = await prisma.poll.findFirst({
        select: defaultSelectFields,
        where: input.admin
          ? {
              adminUrlId: input.urlId,
            }
          : {
              participantUrlId: input.urlId,
            },
      });

      if (!poll) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      // We want to keep the adminUrlId in if the user is view
      if (!input.admin && ctx.user.id !== poll.userId) {
        return { ...poll, admin: input.admin, adminUrlId: "" };
      }

      return { ...poll, admin: input.admin };
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

      return { ...poll, admin: true };
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

      return { ...claimedPoll, admin: true };
    },
  });
