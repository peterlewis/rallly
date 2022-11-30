import { Button } from "@/components/button";
import Menu from "@/components/icons/menu.svg";
import Logo from "~/public/logo.svg";

export const ParticipantPageLayout: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="sm:line-pattern h-full max-h-full overflow-hidden sm:p-8">
      <div className="mx-auto flex h-full max-w-3xl flex-col rounded-md bg-white sm:h-[calc(100vh-100px)] sm:max-h-[720px] sm:border">
        {/* <div className="flex items-center justify-between border-b py-2 px-3">
          <Logo className="h-6 text-primary-500" />
          <Button type="ghost" icon={<Menu />} />
        </div> */}
        <div className="min-h-0 grow">{children}</div>
      </div>
    </div>
  );
};
