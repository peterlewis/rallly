import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import React from "react";
import { createStateContext } from "react-use";

import Calendar from "@/components/icons/calendar.svg";
import Chat from "@/components/icons/chat.svg";
import Graph from "@/components/icons/graph.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { Comments } from "./participant-page/comments";
import { EventDetails } from "./participant-page/event-details";
import { ParticipantPageLayout } from "./participant-page/layout";
import { NewResponseForm } from "./participant-page/new-response-form";
import { usePoll } from "./participant-page/poll-context";
import { ParticipantPageRouterProvider } from "./participant-page/router";
import { TargetTimezoneProvider } from "./participant-page/target-timezone";

const Tab = (props: {
  value: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const Icon = props.icon;
  return (
    <Tabs.Trigger
      className={clsx(
        "data-[state=active]:text-primary-500 grow basis-0 border-t-transparent py-2 text-sm",
      )}
      value={props.value}
    >
      <div className="text-center">
        <Icon className="inline-block h-5" />
        <div>{props.title}</div>
      </div>
    </Tabs.Trigger>
  );
};

export const ParticipantPage: React.VoidFunctionComponent = () => {
  const data = usePoll();

  const [tab, setTab] = React.useState<string>("/");

  return (
    <ParticipantPageRouterProvider
      initialState={{
        path: "vote",
        votes: data.options.map((option) => ({ optionId: option.id })),
      }}
    >
      <TargetTimezoneProvider initialValue={getBrowserTimeZone()}>
        <ParticipantPageLayout>
          <Tabs.Root
            value={tab}
            onValueChange={setTab}
            className="flex h-full flex-col divide-y"
          >
            <Tabs.Content className="min-h-0 grow" value="/">
              <EventDetails className="p-6" />
            </Tabs.Content>
            <Tabs.Content className="grow" value="/results">
              <div>Results</div>
            </Tabs.Content>
            <Tabs.Content className="min-h-0 grow" value="/comments">
              <Comments />
            </Tabs.Content>
            <Tabs.List className="flex divide-x">
              <Tab icon={Calendar} title="Meeting" value="/" />
              <Tab icon={Graph} title="Results" value="/results" />
              <Tab icon={Chat} title="Comments" value="/comments" />
            </Tabs.List>
          </Tabs.Root>
        </ParticipantPageLayout>
      </TargetTimezoneProvider>
    </ParticipantPageRouterProvider>
  );
};
