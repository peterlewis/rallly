import { Button } from "@/components/button";
import Menu from "@/components/icons/menu.svg";
import Logo from "~/public/logo.svg";

export const ParticipantPageLayout: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="sm:line-pattern">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between border-b py-2 px-3">
          <Logo className="h-6 text-primary-500" />
          <Button type="ghost" icon={<Menu />} />
        </div>
        {children}
      </div>
    </div>
  );
};
