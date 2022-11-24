import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { usePrevious } from "react-use";

import User from "@/components/icons/user-solid.svg";

export interface PopularityScoreProps {
  yesScore: number;
  ifNeedBeScore?: number;
  highlight?: boolean;
}

const Score = React.forwardRef<
  HTMLDivElement,
  {
    icon: React.ComponentType<{ className?: string }>;
    score: number;
  }
>(function Score({ icon: Icon, score }, ref) {
  const prevScore = usePrevious(score);

  const multiplier = prevScore !== undefined ? score - prevScore : 0;

  return (
    <div ref={ref} className="inline-flex items-center text-sm">
      <Icon className="mr-1 inline-block h-4 transition-opacity" />
      <span className="inline-block">
        <AnimatePresence initial={false} exitBeforeEnter={true}>
          <motion.span
            transition={{
              duration: 0.1,
            }}
            initial={{
              y: 10 * multiplier,
            }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              y: 10 * multiplier,
            }}
            key={score}
            className="inline-block tabular-nums"
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
});

export const ScoreSummary: React.VoidFunctionComponent<PopularityScoreProps> =
  React.memo(function PopularityScore({ yesScore }) {
    return (
      <div
        data-testid="popularity-score"
        className="relative inline-flex items-center space-x-2"
      >
        <Score icon={User} score={yesScore} />
      </div>
    );
  });
