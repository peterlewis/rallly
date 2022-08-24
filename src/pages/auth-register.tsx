import { GetServerSideProps, NextPage } from "next";

import { prisma } from "~/prisma/db";

import {
  decryptToken,
  RegistrationTokenPayload,
  withSessionSsr,
} from "../utils/auth";

const Page: NextPage = () => {
  return null;
};

export default Page;

export const getServerSideProps: GetServerSideProps = withSessionSsr(
  async (ctx) => {
    const token = ctx.query.token as string;
    const parsedToken = await decryptToken<RegistrationTokenPayload>(token);

    const user = await prisma.user.upsert({
      where: {
        email: parsedToken.email,
      },
      create: parsedToken,
      update: {},
    });

    ctx.req.session.user = {
      isGuest: false,
      id: user.id,
      name: user.name,
      email: user.email,
    };

    await ctx.req.session.save();

    return {
      redirect: {
        destination: "/polls",
        permanent: false,
      },
    };
  },
);
