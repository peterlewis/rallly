import { NextPage } from "next";
import React from "react";

import { UserSession } from "@/utils/auth";

import { useRequiredContext } from "./use-required-context";

export const UserContext =
  React.createContext<{
    user: UserSession;
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

export const withUserSession = <P extends { user: UserSession }>(
  Component: NextPage,
): NextPage<P> => {
  const Page: NextPage<P> = (props) => {
    const [user, setUser] = React.useState<UserSession>(props.user);
    return (
      <UserContext.Provider value={{ user, setUser }}>
        <Component {...props} />
      </UserContext.Provider>
    );
  };
  return Page;
};
