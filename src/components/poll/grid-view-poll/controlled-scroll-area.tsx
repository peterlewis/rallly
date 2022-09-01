import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { usePollContext } from "./poll-context";

const ControlledScrollArea: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  className?: string;
}> = ({ className, children }) => {
  const { maxScrollPosition, scrollPosition, goToNextPage } = usePollContext();

  return (
    <div
      className={clsx(
        "relative box-border min-w-0 select-none overflow-hidden",
        className,
      )}
    >
      {scrollPosition > 0 ? (
        <div className="absolute left-0 z-10 h-full w-2 bg-gradient-to-r from-white/90 to-white/0" />
      ) : null}
      {scrollPosition < maxScrollPosition ? (
        <div
          onClick={goToNextPage}
          className="absolute right-0 z-10 h-full w-8 bg-gradient-to-r from-white/0 to-white/90"
        />
      ) : null}
      <AnimatePresence initial={false}>
        <motion.div
          className="flex h-full"
          transition={{
            type: "spring",
            mass: 0.1,
          }}
          initial={{ x: 0 }}
          animate={{ x: scrollPosition * -1 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ControlledScrollArea;
