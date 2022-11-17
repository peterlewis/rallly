import { AnimatePresence, motion } from "framer-motion";

import CheckCircle from "@/components/icons/check-circle.svg";

import { Button } from "../../button";

export const Confirmation = () => {
  return (
    <div className="p-6 text-center">
      <AnimatePresence>
        <motion.div
          transition={{ delay: 0.2 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle className="mb-3 inline-block h-20 text-green-400" />
        </motion.div>
      </AnimatePresence>
      <div className="mb-2 text-3xl font-semibold">Thank you</div>
      <div className="mb-6 text-lg text-slate-700/75">
        Your submission has been saved
      </div>
      <div className="action-group justify-center">
        <Button>Edit submission</Button>
        <Button>View results</Button>
      </div>
    </div>
  );
};
