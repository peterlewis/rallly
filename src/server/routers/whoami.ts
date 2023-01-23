import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import {
  createGuestUser,
  decryptToken,
  mergeGuestsIntoUser,
  UserSession,
} from "../../utils/auth";
import { nanoid } from "../../utils/nanoid";
import { publicProcedure, router } from "../trpc";

export const whoami = router({
  get: publicProcedure.query(async ({ ctx }): Promise<UserSession> => {
    if (ctx.user.isGuest) {
      return { isGuest: true, id: ctx.user.id };
    }

    const user = await prisma.user.findUnique({
      select: { id: true, name: true, email: true },
      where: { id: ctx.user.id },
    });

    if (user === null) {
      const guestUser = await createGuestUser();
      ctx.session.user = guestUser;
      await ctx.session.save();

      return guestUser;
    }

    return { isGuest: false, ...user };
  }),
  destroy: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy();
  }),
  auth: publicProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { code } = input;
      const {
        email,
        path = "/new",
        guestId,
      } = await decryptToken<{
        email?: string;
        path?: string;
        guestId?: string;
      }>(code);

      if (!email) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          id: await nanoid(),
          name: email.substring(0, email.indexOf("@")),
          email,
        },
      });

      const guestIds: string[] = [];

      // guest id from existing sessions
      if (ctx.session.user?.isGuest) {
        guestIds.push(ctx.session.user.id);
      }
      // guest id from token
      if (guestId && guestId !== ctx.session.user?.id) {
        guestIds.push(guestId);
      }

      if (guestIds.length > 0) {
        await mergeGuestsIntoUser(user.id, guestIds);
      }

      ctx.session.user = {
        isGuest: false,
        id: user.id,
      };

      await ctx.session.save();
    }),
});
