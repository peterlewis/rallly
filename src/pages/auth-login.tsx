/**
 * This method of logging in is deprecated and is replaced with a different strategy.
 * It remains in place so that existing tokens issued before the new strategy is released still work
 * but it can be removed shortly after since all tokens would be expired anyway.
 */
import { GetServerSideProps, NextPage } from "next";

import { prisma } from "~/prisma/db";

import {
  decryptToken,
  LoginTokenPayload,
  mergeGuestsIntoUser,
  withSessionSsr,
} from "../utils/auth";

const Page: NextPage = () => {
  return null;
};

export default Page;

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  async (ctx) => {
    const token = ctx.query.token as string;
    const parsedToken = await decryptToken<LoginTokenPayload>(token);

    const user = await prisma.user.findUnique({
      where: {
        id: parsedToken.userId,
      },
    });

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (ctx.req.session.user?.isGuest) {
      await mergeGuestsIntoUser(user.id, [ctx.req.session.user.id]);
    }

    ctx.req.session.user = {
      isGuest: false,
      id: user.id,
      name: user.name,
      email: user.email,
    };

    await ctx.req.session.save();

    return {
      redirect: {
        destination: parsedToken.redirect ?? "/polls",
        permanent: false,
      },
    };
  },
);
