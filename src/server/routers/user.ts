import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { absoluteUrl } from "@/utils/absolute-url";
import {
  createGuestUser,
  createToken,
  decryptToken,
  LoginTokenPayload,
  mergeGuestsIntoUser,
  RegistrationTokenPayload,
} from "@/utils/auth";
import { sendEmail } from "@/utils/send-email";
import { prisma } from "~/prisma/db";

import { generateOtp } from "../../utils/nanoid";
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
    resolve: async ({ ctx, input }): Promise<{ ok: boolean }> => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        return { ok: false };
      }

      const otp = await generateOtp();

      const token = await createToken<LoginTokenPayload>({
        userId: user.id,
        code: otp,
      });

      ctx.session.token = token;
      await ctx.session.save();

      await sendEmail({
        to: input.email,
        subject: `Your 6-digit code is: ${otp}`,
        html: `
          <p>Your 6-digit code is:</p>
          <p><strong style="font-size: 24px">${otp}</strong></p>
          <p>Use this code to complete the verification process.</p>
          <p><strong>This code is valid for 15 minutes</strong></p>
        `,
      });

      return { ok: true };
    },
  })
  .mutation("verify", {
    input: z.object({
      code: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      if (!ctx.session.token) {
        return { ok: false };
      }

      const { userId, code } = await decryptToken<LoginTokenPayload>(
        ctx.session.token,
      );

      if (code !== input.code) {
        return { ok: false };
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return { ok: false };
      }

      if (ctx.session.user?.isGuest) {
        await mergeGuestsIntoUser(user.id, [ctx.session.user.id]);
      }

      ctx.session.user = {
        isGuest: false,
        id: user.id,
        name: user.name,
        email: user.email,
      };

      delete ctx.session.token;

      await ctx.session.save();

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
  })
  .mutation("reset", {
    resolve: async ({ ctx }) => {
      const guestUser = await createGuestUser();
      ctx.session.user = guestUser;
      await ctx.session.save();

      return guestUser;
    },
  });
