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
  .mutation("verify", {
    input: z.object({
      token: z.string(),
      code: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { userId, code } = await decryptToken<LoginTokenPayload>(
        input.token,
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

      await ctx.session.save();

      return { ok: true };
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
