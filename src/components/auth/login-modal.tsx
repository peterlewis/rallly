import React from "react";

import { RegisteredUserSession } from "../../utils/auth";
import { useModalContext } from "../modal/modal-provider";
import { useUser } from "../user-provider";
import { LoginForm, RegisterForm } from "./login-form";

export const LoginModal: React.VoidFunctionComponent<{
  onDone: (user: RegisteredUserSession) => void;
}> = ({ onDone }) => {
  const [hasAccount, setHasAccount] = React.useState(false);
  const [defaultEmail, setDefaultEmail] = React.useState("");

  return (
    <div className="w-[460px] max-w-full overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="p-4 sm:p-6">
        {hasAccount ? (
          <RegisterForm
            defaultValues={{ email: defaultEmail }}
            onRegistered={onDone}
            onClickLogin={(e) => {
              e.preventDefault();
              setHasAccount(false);
            }}
          />
        ) : (
          <LoginForm
            onAuthenticated={onDone}
            onClickRegister={(e, email) => {
              e.preventDefault();
              setDefaultEmail(email);
              setHasAccount(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export const useLoginModal = () => {
  const modalContext = useModalContext();
  const { setUser } = useUser();

  const openLoginModal = () => {
    modalContext.render({
      overlayClosable: true,
      showClose: true,
      content: function Content({ close }) {
        return (
          <LoginModal
            onDone={(user) => {
              setUser(user);
              close();
            }}
          />
        );
      },
      footer: null,
    });
  };
  return { openLoginModal };
};
