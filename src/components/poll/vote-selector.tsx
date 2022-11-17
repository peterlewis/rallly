import { VoteType } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";

import Check from "@/components/icons/check-line.svg";
import IfNeedBe from "@/components/icons/if-need-be-line.svg";
import X from "@/components/icons/x-line.svg";

export interface VoteSelectorProps {
  value?: VoteType;
  onChange?: (value: VoteType) => void;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  className?: string;
}

const orderedVoteTypes: VoteType[] = ["yes", "ifNeedBe", "no"];

export const useVoteState = (value?: VoteType) => {
  const toggle = React.useCallback(
    (v?: VoteType) => {
      const currentValue = v ?? value;
      if (!currentValue) {
        return orderedVoteTypes[0];
      }

      return orderedVoteTypes[
        (orderedVoteTypes.indexOf(currentValue) + 1) % orderedVoteTypes.length
      ];
    },
    [value],
  );

  return { toggle };
};

export const VoteSelector = React.forwardRef<
  HTMLButtonElement,
  VoteSelectorProps
>(function VoteSelector(
  { value, onChange, onFocus, onBlur, onKeyDown, className },
  ref,
) {
  const { toggle } = useVoteState(value);

  const Icon: React.ComponentType<{ className?: string }> =
    React.useMemo(() => {
      switch (value) {
        case "yes":
          return Check;
        case "no":
          return X;
        case "ifNeedBe":
          return IfNeedBe;
      }
    }, [value]);

  if (!Icon && value) {
    console.log("wtf", value);
  }

  return (
    <button
      role="button"
      data-testid="vote-selector"
      type="button"
      onFocus={onFocus}
      onBlur={onBlur}
      className={clsx(
        "relative flex h-5 w-5 items-center justify-center overflow-hidden rounded border focus:ring-2 active:bg-gray-100",
        {
          "border-green-300 bg-green-50 text-green-400 focus:ring-green-200":
            value === "yes",
          "border-amber-200 bg-amber-50 text-amber-300": value === "ifNeedBe",
          "border-slate-200 bg-slate-50 text-slate-400": value === "no",
          "bg-white": !value,
        },
        className,
      )}
      onKeyDown={onKeyDown}
      onClick={() => {
        onChange?.(toggle());
      }}
      ref={ref}
    >
      {Icon ? <Icon className="absolute h-5 " /> : null}
    </button>
  );
});
