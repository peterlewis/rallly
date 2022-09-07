import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { usePollContext } from "./poll-context";

const ControlledScrollArea: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  className?: string;
}> = ({ className, children }) => {
  const { scrollPosition } = usePollContext();

  return (
    <div
      className={clsx(
        "relative box-border min-w-0 select-none overflow-hidden",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="flex h-full"
          transition={{
            type: "spring",
            mass: 0.5,
            stiffness: 100,
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
