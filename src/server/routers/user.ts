import { TRPCError } from "@trpc/server";
import { IronSessionData } from "iron-session";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import { absoluteUrl } from "../../utils/absolute-url";
import { createToken, LoginTokenPayload } from "../../utils/auth";
import { sendEmail } from "../../utils/send-email";
import { createRouter } from "../createRouter";

const requireUser = (user: IronSessionData["user"]) => {
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Tried to access user route without a session",
    });
  }
  return user;
};

export const user = createRouter()
  .query("getPolls", {
    resolve: async ({ ctx }) => {
      const user = requireUser(ctx.session.user);
      const userPolls = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          polls: {
            where: {
              deleted: false,
            },
            select: {
              title: true,
              closed: true,
              verified: true,
              createdAt: true,
              adminUrlId: true,
            },
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      return userPolls;
    },
  })
  .mutation("changeName", {
    input: z.object({
      name: z.string().min(1).max(100),
    }),
    resolve: async ({ ctx, input }) => {
      if (!ctx.session.user || ctx.session.user.isGuest) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: input.name,
        },
      });

      ctx.session.user.name = input.name;
      await ctx.session.save();
    },
  })
  .mutation("login", {
    input: z.object({
      email: z.string(),
      redirect: z.string().optional(),
    }),
    resolve: async ({ input }): Promise<{ ok: boolean }> => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        return { ok: false };
      }

      const token = await createToken<LoginTokenPayload>({
        userId: user.id,
        redirect: input.redirect,
      });

      await sendEmail({
        to: input.email,
        subject: "Login via magic link",
        html: `<p>Click the link below to login.</p><p><a href="${absoluteUrl()}/auth-login?token=${token}">Confirm your email</a>`,
      });

      return { ok: true };
    },
  });
