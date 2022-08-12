import { Tab } from "@headlessui/react";
import clsx from "clsx";
import React from "react";

import { General } from "./manage/general";
import { Options } from "./manage/options";

const TabItem: React.VFC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Tab
      className={({ selected }) =>
        clsx(
          "border-b- -mb-[1px] h-12 border-b-2 px-1 font-medium",
          selected
            ? "border-b-primary-600 text-primary-600"
            : "border-b-transparent text-gray-500 hover:text-gray-600",
        )
      }
    >
      {children}
    </Tab>
  );
};

export const Manage: React.VFC = () => {
  return (
    <div className="mt-8">
      <div className="mb-4 text-3xl">Manage your meeting poll</div>
      <Tab.Group>
        <Tab.List className="mb-4 flex space-x-6 border-b">
          <TabItem>General</TabItem>
          <TabItem>Options</TabItem>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <General />
          </Tab.Panel>
          <Tab.Panel>
            <Options />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
