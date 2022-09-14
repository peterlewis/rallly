import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

import VoteIcon from "./vote-icon";

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
  return React.useMemo(
    () => ({
      toggle: () => {
        if (!value) {
          return orderedVoteTypes[0];
        }

        return orderedVoteTypes[
          (orderedVoteTypes.indexOf(value) + 1) % orderedVoteTypes.length
        ];
      },
    }),
    [value],
  );
};

export const VoteSelector = React.forwardRef<
  HTMLButtonElement,
  VoteSelectorProps
>(function VoteSelector(
  { value, onChange, onFocus, onBlur, onKeyDown, className },
  ref,
) {
  const { toggle } = useVoteState(value);

  return (
    <button
      role="button"
      data-testid="vote-selector"
      type="button"
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={clsx(
        "group relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border bg-white/50 focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-0 active:bg-gray-100",
        className,
        {
          "border-green-400/50": value === "yes",
          "border-amber-400/50": value === "ifNeedBe",
        },
      )}
      onClick={() => {
        onChange?.(toggle());
      }}
      ref={ref}
    >
      {value ? <VoteIcon type={value} /> : null}
    </button>
  );
});
