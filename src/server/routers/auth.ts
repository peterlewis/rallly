import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "~/prisma/db";

import { absoluteUrl } from "../../utils/absolute-url";
import {
  createToken,
  decryptToken,
  LoginTokenPayload,
  mergeGuestsIntoUser,
  RegistrationTokenPayload,
} from "../../utils/auth";
import { generateOtp } from "../../utils/nanoid";
import { sendEmail } from "../../utils/send-email";
import { createRouter } from "../createRouter";

const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string,
) => {
  await sendEmail({
    to: email,
    subject: `Your 6-digit code is: ${code}`,
    html: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="color: rgb(51 65 85); font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;">
        <tr>
          <td style="text-align:center">
            <table style="text-align:left; max-width: 100%" width="600px">
              <tr>
                <td style="padding-top:32px; padding-bottom:32px">
                  <p><img src="${absoluteUrl()}/logo.png" width="150" height="28" /></p>
                  <p>Hi ${name},</p>
                  <p>Your 6-digit code is:</p>
                  <p><strong style="font-size: 24px">${code}</strong></p>
                  <p>This code is <strong>valid for 10 minutes</strong></p>
                  <p>Use this code to complete the verification process.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  });
};

export const auth = createRouter()
  .mutation("requestRegistration", {
    input: z.object({
      name: z.string(),
      email: z.string(),
    }),
    resolve: async ({
      input,
    }): Promise<
      { ok: true; token: string } | { ok: false; code: "userAlreadyExists" }
    > => {
      const user = await prisma.user.findUnique({
        select: {
          id: true,
        },
        where: {
          email: input.email,
        },
      });

      if (user) {
        return { ok: false, code: "userAlreadyExists" };
      }

      const code = await generateOtp();

      const token = await createToken<RegistrationTokenPayload>({
        name: input.name,
        email: input.email,
        code,
      });

      await sendVerificationEmail(input.email, input.name, code);

      return { ok: true, token };
    },
  })
  .mutation("authenticateRegistration", {
    input: z.object({
      token: z.string(),
      code: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { name, email, code } =
        await decryptToken<RegistrationTokenPayload>(input.token);

      if (input.code !== code) {
        return { ok: false };
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
        },
      });

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

      return { ok: true, user: ctx.session.user };
    },
  })
  .mutation("requestLogin", {
    input: z.object({
      email: z.string(),
    }),
    resolve: async ({ input }): Promise<{ token?: string }> => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        return { token: undefined };
      }

      const code = await generateOtp();

      const token = await createToken<LoginTokenPayload>({
        userId: user.id,
        code,
      });

      await sendVerificationEmail(input.email, user.name, code);

      return { token };
    },
  })
  .mutation("authenticateLogin", {
    input: z.object({
      token: z.string(),
      code: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      const { userId, code } = await decryptToken<LoginTokenPayload>(
        input.token,
      );

      if (input.code !== code) {
        return { user: null };
      }

      const user = await prisma.user.findUnique({
        select: { id: true, name: true, email: true },
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The user doesn't exist anymore",
        });
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

      return { user: ctx.session.user };
    },
  });
