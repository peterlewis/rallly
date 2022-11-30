import * as Tabs from "@radix-ui/react-tabs";
import { createStateContext } from "react-use";

import { EventDetails } from "./event-details";
import { NewResponseForm } from "./new-response-form";

type MeetingTabPath =
  | {
      path: "/" | "/new";
    }
  | {
      path: "edit";
      participantId: string;
    };

export const [useMeetingTabRouter, MeetingTabRouterProvider] =
  createStateContext<MeetingTabPath>({
    path: "/",
  });

export const MeetingTab = () => {
  const [router, setRouter] = useMeetingTabRouter();
  return (
    <Tabs.Root className="h-full" value={router.path}>
      <Tabs.Content value="/">
        <EventDetails />
      </Tabs.Content>
      <Tabs.Content className="h-full" value="/new">
        <NewResponseForm
          onCancel={() => {
            setRouter({ path: "/" });
          }}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
