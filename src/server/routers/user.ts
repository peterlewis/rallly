import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { absoluteUrl } from "@/utils/absolute-url";
import {
  createToken,
  LoginTokenPayload,
  RegistrationTokenPayload,
} from "@/utils/auth";
import { sendEmail } from "@/utils/send-email";
import { prisma } from "~/prisma/db";

import { createRouter } from "../createRouter";

export const user = createRouter()
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
  })
  .mutation("register", {
    input: z.object({
      name: z.string(),
      email: z.string(),
    }),
    resolve: async ({ input }) => {
      const token = await createToken<RegistrationTokenPayload>(input);

      const baseUrl = absoluteUrl();

      await sendEmail({
        to: input.email,
        subject: "Please confirm your email address",
        html: `<p>Hi ${input.name},</p><p>Click the link below to confirm your email address.</p><p><a href="${baseUrl}/auth-register?token=${token}">Confirm your email</a>`,
      });
    },
  });
