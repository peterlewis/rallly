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
import { verification } from "./polls/verification";

const defaultSelectFields: {
  id: true;
  timeZone: true;
  title: true;
  authorName: true;
  location: true;
  description: true;
  createdAt: true;
  participantUrlId: true;
  adminUrlId: true;
  verified: true;
  userId: true;
  closed: true;
  legacy: true;
  demo: true;
  notifications: true;
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
  title: true,
  authorName: true,
  location: true,
  description: true,
  createdAt: true,
  participantUrlId: true,
  adminUrlId: true,
  verified: true,
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
  .merge("verification.", verification)
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
          authorName: ctx.user.isGuest ? "Guest" : ctx.user.name,
          demo: input.demo,
          verified: !ctx.user.isGuest,
          adminUrlId,
          participantUrlId: await nanoid(),
          user: ctx.user.isGuest
            ? undefined
            : {
                connect: {
                  email: ctx.user.email,
                },
              },
          userId: ctx.user.isGuest ? ctx.user.id : undefined,
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
  });
