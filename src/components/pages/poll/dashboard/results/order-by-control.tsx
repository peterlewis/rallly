import * as RadioGroup from "@radix-ui/react-radio-group";
import React from "react";

import { useResultsConfig } from "./context";

export const OrderByControl = () => {
  const [{ orderBy }, setConfig] = useResultsConfig();
  return (
    <div>
      <div>Order by</div>
      <RadioGroup.Root
        value={orderBy}
        onValueChange={(newOrderBy) => {
          setConfig((config) => ({ ...config, orderBy: newOrderBy as any }));
        }}
        className="action-group"
      >
        <RadioGroup.Item
          value="date"
          className="border-b-4 font-semibold data-[state=checked]:border-primary-500"
        >
          Date
        </RadioGroup.Item>
        <RadioGroup.Item
          className="border-b-4 font-semibold data-[state=checked]:border-primary-500"
          value="popularity"
        >
          Popularity
        </RadioGroup.Item>
      </RadioGroup.Root>
    </div>
  );
};
