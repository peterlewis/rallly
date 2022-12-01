import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import React from "react";

import Calendar from "@/components/icons/calendar.svg";
import Chat from "@/components/icons/chat.svg";
import Graph from "@/components/icons/graph.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { Comments } from "./participant-page/comments";
import { ParticipantPageLayout } from "./participant-page/layout";
import {
  MeetingTab,
  MeetingTabRouterProvider,
} from "./participant-page/meeting-tab";
import { NewResponseReducerProvider } from "./participant-page/new-response-form";
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
        "grow basis-0 border-b border-t-transparent py-2 text-sm data-[state=active]:border-b-transparent data-[state=active]:text-primary-500",
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
  const [tab, setTab] = React.useState<string>("/");

  return (
    <TargetTimezoneProvider initialValue={getBrowserTimeZone()}>
      <ParticipantPageLayout>
        <Tabs.Root
          value={tab}
          onValueChange={setTab}
          className="flex h-full flex-col"
        >
          <Tabs.List className="flex divide-x border-t">
            <Tab icon={Calendar} title="Meeting" value="/" />
            <Tab icon={Graph} title="Results" value="/results" />
            <Tab icon={Chat} title="Comments" value="/comments" />
          </Tabs.List>
          <div className="min-h-0 grow overflow-auto">
            <MeetingTabRouterProvider>
              <NewResponseReducerProvider>
                <Tabs.Content className="h-full" value="/">
                  <MeetingTab />
                </Tabs.Content>
              </NewResponseReducerProvider>
            </MeetingTabRouterProvider>
            <Tabs.Content className="h-full" value="/results">
              <div>Results</div>
            </Tabs.Content>
            <Tabs.Content className="h-full" value="/comments">
              <Comments />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </ParticipantPageLayout>
    </TargetTimezoneProvider>
  );
};
