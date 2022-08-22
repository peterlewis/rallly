import { z } from "zod";

import { absoluteUrl } from "../../utils/absolute-url";
import { sendEmailTemplate } from "../../utils/api-utils";
import { createToken } from "../../utils/auth";
import { sendEmail } from "../../utils/send-email";
import { createRouter } from "../createRouter";

const getOtp = () => {
  const otp: string[] = [];
  for (let i = 0; i < 4; i++) {
    otp.push(Math.floor(Math.random() * 10).toString());
  }
  return otp.join("");
};
export const login = createRouter().mutation("login", {
  input: z.object({
    email: z.string(),
    path: z.string(),
  }),
  resolve: async ({ ctx, input }) => {
    const { email, path } = input;
    const code = getOtp(); // generate otp
    const homePageUrl = absoluteUrl();
    const user = ctx.user;

    const token = await createToken({
      email,
      guestId: user.id,
      code,
      path,
    });

    const loginUrl = `${homePageUrl}/login?code=${token}`;

    await sendEmail({
      to: email,
      subject: `Your one-time password is ${code}`,
      html: `
        <p>Your one-time password is: <strong>${code}</strong></p>
        <p>Alternatively, you can login with this link: <a href="${loginUrl}">${loginUrl}</a></p>
      `,
    });
  },
});
