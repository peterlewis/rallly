import { z } from "zod";

import { prisma } from "~/prisma/db";

import { sendNotification } from "../../../utils/api-utils";
import { createRouter } from "../../createRouter";

export const comments = createRouter()
  .query("list", {
    input: z.object({
      pollId: z.string(),
    }),
    resolve: async ({ input: { pollId } }) => {
      return await prisma.comment.findMany({
        where: { pollId },
        select: {
          id: true,
          content: true,
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
          createdAt: true,
        },
        orderBy: [
          {
            createdAt: "asc",
          },
        ],
      });
    },
  })
  .mutation("add", {
    input: z.object({
      pollId: z.string(),
      authorName: z.string().optional(),
      content: z.string(),
    }),
    resolve: async ({ ctx, input: { pollId, authorName, content } }) => {
      const newComment = await prisma.comment.create({
        data: {
          content,
          pollId,
          authorName: authorName ?? "", // TODO (Luke Vella) [2022-10-19]: Remove authorName
          userId: ctx.user.id,
        },
        select: {
          id: true,
          content: true,
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
          createdAt: true,
        },
      });

      await sendNotification(pollId, {
        type: "newComment",
        authorName: authorName || "Guest",
        comment: newComment.content,
      });

      return newComment;
    },
  })
  .mutation("delete", {
    input: z.object({
      pollId: z.string(),
      commentId: z.string(),
    }),
    resolve: async ({ input: { pollId, commentId } }) => {
      await prisma.comment.delete({
        where: {
          id_pollId: {
            id: commentId,
            pollId,
          },
        },
      });
    },
  });
