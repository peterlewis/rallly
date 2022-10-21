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
        "rounded-md border border-black/10 bg-white/50 p-1",
        className,
      )}
      onKeyDown={onKeyDown}
      onClick={() => {
        onChange?.(toggle());
      }}
      ref={ref}
    >
      <div
        className={clsx(
          "relative flex h-4 w-4 items-center justify-center overflow-hidden rounded border text-white  active:bg-gray-100",
          {
            "border-green-400 bg-green-400 text-green-100 focus:ring-green-200":
              value === "yes",
            "border-amber-300 bg-amber-300 text-amber-100":
              value === "ifNeedBe",
            "border-slate-300 bg-slate-300 text-slate-100": value === "no",
            "border-transparent bg-transparent": !value,
            "shadow-sm": !!value,
          },
        )}
      >
        {Icon ? <Icon className="absolute h-5 " /> : null}
      </div>
    </button>
  );
});
