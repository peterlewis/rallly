import { NextPage } from "next";
import React from "react";

import { UserSession } from "@/utils/auth";

import { trpc } from "../utils/trpc";
import { useRequiredContext } from "./use-required-context";

export const UserContext =
  React.createContext<{
    user: UserSession;
    resetGuestUser: () => Promise<UserSession>;
    setUser: React.Dispatch<React.SetStateAction<UserSession>>;
  } | null>(null);

export const useUser = () => {
  return useRequiredContext(UserContext, "UserContext");
};

export const useAuthenticatedUser = () => {
  const { user, ...rest } = useRequiredContext(UserContext, "UserContext");
  if (user.isGuest) {
    throw new Error("Expected authenticated user");
  }

  return { user, ...rest };
};

export const IfAuthenticated = (props: { children?: React.ReactNode }) => {
  const { user } = useUser();
  if (user.isGuest) {
    return null;
  }

  return <>{props.children}</>;
};

export const IfGuest = (props: { children?: React.ReactNode }) => {
  const { user } = useUser();
  if (!user.isGuest) {
    return null;
  }

  return <>{props.children}</>;
};

export const withUserSession = <P extends { user: UserSession }>(
  Component: NextPage,
): NextPage<P> => {
  const Page: NextPage<P> = (props) => {
    const [user, setUser] = React.useState<UserSession>(props.user);
    const resetGuestUser = trpc.useMutation("user.reset", {
      onSuccess: setUser,
    });

    return (
      <UserContext.Provider
        value={{
          user,
          setUser,
          resetGuestUser: resetGuestUser.mutateAsync,
        }}
      >
        <Component {...props} />
      </UserContext.Provider>
    );
  };
  return Page;
};
