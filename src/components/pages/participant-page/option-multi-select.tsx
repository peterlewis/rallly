import { VoteType } from "@prisma/client";
import clsx from "clsx";
import produce from "immer";
import React from "react";

import { useDayjs } from "../../../utils/dayjs";
import { useVoteState, VoteSelector } from "../../poll/vote-selector";
import { Option, StyledList, StyledListItem } from "./styled-list";

interface OptionWithValue extends Option {
  value?: VoteType;
}

const Row: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  value?: VoteType;
  onChange: (value: VoteType) => void;
}> = ({ children, value, onChange }) => {
  const { toggle } = useVoteState();
  const paintValue = React.useContext(OptionMultiSelectContext);
  return (
    <div className="">
      <div
        role="button"
        onMouseDown={() => {
          onChange(toggle(value));
        }}
        onMouseEnter={() => {
          if (paintValue) {
            onChange(paintValue);
          }
        }}
        className={clsx(
          "flex h-12 select-none items-center gap-3 rounded border bg-white px-3 text-slate-700/90",
          {
            "border-amber-400 bg-amber-50 ring-amber-400": value === "ifNeedBe",
            "border-green-400 bg-green-50 ring-green-400": value === "yes",
            "border-slate-400 bg-slate-50 ring-slate-400": value === "no",
          },
        )}
      >
        <VoteSelector value={value} className="pointer-events-none" />
        {children}
      </div>
    </div>
  );
};

const OptionMultiSelectContext =
  React.createContext<VoteType | undefined>(undefined);

export const OptionMultiSelect: React.VoidFunctionComponent<{
  className?: string;
  options: Array<OptionWithValue>;
  onChange?: (value: Array<OptionWithValue>) => void;
}> = ({ options, onChange, className }) => {
  const { dayjs } = useDayjs();

  const [paintValue, setPaintValue] = React.useState<VoteType>();

  React.useEffect(() => {
    const handler = () => {
      setPaintValue(undefined);
    };
    window.addEventListener("mouseup", handler);
    return () => {
      window.removeEventListener("mouseup", handler);
    };
  }, []);

  return (
    <OptionMultiSelectContext.Provider value={paintValue}>
      <StyledList
        options={options}
        className={clsx("divide-y", className, {
          "cursor-pointer": !!paintValue,
        })}
        itemRender={({ item }) => (
          <Row
            value={item.value}
            onChange={(newValue) => {
              setPaintValue(newValue);
              onChange?.(
                produce(options, (draft) => {
                  draft[item.index].value = newValue;
                }),
              );
            }}
          >
            <StyledListItem duration={item.duration} start={item.start} />
          </Row>
        )}
      />
    </OptionMultiSelectContext.Provider>
  );
};
