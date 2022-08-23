import React from "react";

import Logo from "~/public/logo.svg";

export const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="h-full bg-white bg-slate-500/10 p-4">
      <div className="flex h-full items-center justify-center">
        <div className="w-[480px] max-w-full overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="border-b border-t-4 border-t-primary-500 bg-slate-500/5 p-4 text-center sm:p-8">
            <Logo className="inline-block h-6 text-primary-500 sm:h-7" />
          </div>
          <div className="p-4 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
