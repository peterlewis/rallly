import {
  IronSession,
  IronSessionOptions,
  sealData,
  unsealData,
} from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";

import { prisma } from "~/prisma/db";

import { randomid } from "./nanoid";

const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_PASSWORD,
  cookieName: "rallly-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 0, // basically forever
};

const setUser = async (session: IronSession) => {
  if (!session.user) {
    session.user = await createGuestUser();
    await session.save();
  }

  if (!session.user.isGuest) {
    // Check registered user still exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      session.user = await createGuestUser();
      await session.save();
    }
  }
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(async (req, res) => {
    await setUser(req.session);

    return await handler(req, res);
  }, sessionOptions);
}

export function withSessionSsr(handler: GetServerSideProps) {
  return withIronSessionSsr(async (context) => {
    const { req } = context;

    await setUser(req.session);

    const res = await handler(context);

    if ("props" in res) {
      return { ...res, props: { ...res.props, user: req.session.user } };
    }

    return res;
  }, sessionOptions);
}

export const decryptToken = async <P extends Record<string, unknown>>(
  token: string,
): Promise<P | Record<string, never>> => {
  return await unsealData(token, { password: sessionOptions.password });
};

export const createToken = async <T extends Record<string, unknown>>(
  payload: T,
) => {
  return await sealData(payload, {
    password: sessionOptions.password,
    ttl: 60 * 10, // 10 minutes
  });
};

export type RegistrationTokenPayload = {
  name: string;
  email: string;
  code: string;
};

export type LoginTokenPayload = {
  userId: string;
  code: string;
};

export type RegisteredUserSession = {
  isGuest: false;
  id: string;
  name: string;
  email: string;
};

export type GuestUserSession = {
  isGuest: true;
  id: string;
};

export type UserSession = GuestUserSession | RegisteredUserSession;

export const withAuthRequired = (options?: {
  getServerSideProps?: GetServerSideProps;
  redirectTo?: string;
}): GetServerSideProps => {
  return withSessionSsr(async (ctx) => {
    if (!ctx.req.session.user || ctx.req.session.user.isGuest !== false) {
      return {
        redirect: {
          destination:
            options?.redirectTo ?? `/login?redirect=${ctx.resolvedUrl}`,
          permanent: false,
        },
      };
    }

    if (options?.getServerSideProps) {
      const res = await options.getServerSideProps(ctx);

      if ("props" in res) {
        return { ...res, props: { ...res.props, user: ctx.req.session.user } };
      }
      return res;
    }

    return { props: { user: ctx.req.session.user } };
  });
};

export const createGuestUser = async (): Promise<{
  id: string;
  isGuest: true;
}> => {
  return {
    isGuest: true,
    id: `guest-${await randomid()}`,
  };
};

export const getCurrentUser = async (
  ctx:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
): Promise<
  | { isGuest: false; name: string; id: string; email: string }
  | { isGuest: true; id: string }
> => {
  const user = ctx.req.session.user;

  if (!user) {
    throw new Error("Tried to get user but no user found.");
  }

  return user;
};

// assigns participants and comments created by guests to a user
// we could have multiple guests because a login might be triggered from one device
// and opened in another one.
export const mergeGuestsIntoUser = async (
  userId: string,
  guestIds: string[],
) => {
  await prisma.poll.updateMany({
    where: {
      userId: {
        in: guestIds,
      },
    },
    data: {
      userId: userId,
    },
  });

  await prisma.participant.updateMany({
    where: {
      userId: {
        in: guestIds,
      },
    },
    data: {
      userId: userId,
    },
  });

  await prisma.comment.updateMany({
    where: {
      userId: {
        in: guestIds,
      },
    },
    data: {
      userId: userId,
    },
  });
};
