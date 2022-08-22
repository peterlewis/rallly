import React from "react";

import Logo from "~/public/logo.svg";

export const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="bg-pattern h-full">
      <div className="flex h-full items-center justify-center">
        <div className="w-[480px] rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Logo className="inline-block h-7 text-primary-500" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
