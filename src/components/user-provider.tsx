import { NextPage } from "next";
import React from "react";

import { UserSession } from "@/utils/auth";

import { useRequiredContext } from "./use-required-context";

export const UserContext = React.createContext<UserSession | null>(null);

export const useUser = () => {
  const user = useRequiredContext(UserContext, "UserContext");
  return { user };
};

export const useAuthenticatedUser = () => {
  const user = useRequiredContext(UserContext, "UserContext");
  if (user.isGuest) {
    throw new Error("Expected authenticated user");
  }

  return { user };
};

export const withUserSession = <P extends { user: UserSession }>(
  Component: NextPage,
): NextPage<P> => {
  const Page: NextPage<P> = (props) => {
    return (
      <UserContext.Provider value={props.user}>
        <Component {...props} />
      </UserContext.Provider>
    );
  };
  return Page;
};
