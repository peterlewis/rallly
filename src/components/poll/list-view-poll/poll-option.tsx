import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";

import ChevronDown from "@/components/icons/chevron-down.svg";

import { usePollData } from "../poll-data-provider";
import { ScoreSummary } from "../score-summary";
import { PollViewParticipant } from "../types";
import UserAvatar from "../user-avatar";
import VoteIcon from "../vote-icon";
import { useVoteSelector, VoteSelector } from "../vote-selector";

export interface PollOptionProps {
  children?: React.ReactNode;
  yesScore: number;
  editable?: boolean;
  vote?: VoteType;
  onChange: (vote: VoteType) => void;
  participants: PollViewParticipant[];
  selectedParticipantId?: string;
  optionIndex: number;
  expanded?: boolean;
}

const PopInOut: React.VoidFunctionComponent<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={clsx(className)}
    >
      {children}
    </motion.div>
  );
};

const PollOptionVoteSummary: React.VoidFunctionComponent<{
  optionIndex: number;
}> = ({ optionIndex }) => {
  const { t } = useTranslation("app");
  const { getParticipantsWhoVoted } = usePollData();
  const participantsWhoVotedYes = getParticipantsWhoVoted("yes", optionIndex);
  const participantsWhoVotedIfNeedBe = getParticipantsWhoVoted(
    "ifNeedBe",
    optionIndex,
  );
  const participantsWhoVotedNo = getParticipantsWhoVoted("no", optionIndex);
  const noVotes =
    participantsWhoVotedYes.length + participantsWhoVotedIfNeedBe.length === 0;
  return (
    <motion.div
      transition={{
        duration: 0.1,
      }}
      initial={{ height: 0, opacity: 0, y: -10 }}
      animate={{ height: "auto", opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -10 }}
      className="text-sm"
    >
      <div>
        {noVotes ? (
          <div className="rounded-lg bg-slate-50 p-2 text-center text-slate-400">
            {t("noVotes")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4">
            <div className="col-span-1 space-y-2">
              {participantsWhoVotedYes.map(({ name }, i) => (
                <div key={i} className="flex">
                  <div className="relative mr-2 flex h-5 w-5 items-center justify-center">
                    <UserAvatar name={name} />
                    <VoteIcon
                      type="yes"
                      size="sm"
                      className="absolute -right-1 -top-1 rounded-full bg-white"
                    />
                  </div>
                  <div className="text-slate-500">{name}</div>
                </div>
              ))}
              {participantsWhoVotedIfNeedBe.map(({ name }, i) => (
                <div key={i} className="flex">
                  <div className="relative mr-2 flex h-5 w-5 items-center justify-center">
                    <UserAvatar name={name} />
                    <VoteIcon
                      type="ifNeedBe"
                      size="sm"
                      className="absolute -right-1 -top-1 rounded-full bg-white"
                    />
                  </div>
                  <div className="text-slate-500">{name}</div>
                </div>
              ))}
            </div>
            <div className="col-span-1 space-y-2">
              {participantsWhoVotedNo.map(({ name }, i) => (
                <div key={i} className="flex">
                  <div className="relative mr-2 flex h-5 w-5 items-center justify-center">
                    <UserAvatar name={name} />
                    <VoteIcon
                      type="no"
                      size="sm"
                      className="absolute -right-1 -top-1 rounded-full bg-white"
                    />
                  </div>
                  <div className="text-slate-500"> {name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SummarizedParticipantList: React.VoidFunctionComponent<{
  participants: string[];
}> = ({ participants }) => {
  return (
    <div className="flex -space-x-1">
      {participants
        .slice(0, participants.length <= 8 ? 8 : 7)
        .map((participant, i) => {
          return (
            <UserAvatar
              key={i}
              className="ring-1 ring-white"
              name={participant}
            />
          );
        })}
      {participants.length > 8 ? (
        <span className="inline-flex h-5 items-center justify-center rounded-full bg-slate-100 px-1 text-xs font-medium ring-1 ring-white">
          +{participants.length - 7}
        </span>
      ) : null}
    </div>
  );
};

const PollOption: React.VoidFunctionComponent<PollOptionProps> = ({
  children,
  selectedParticipantId,
  vote,
  onChange,
  participants,
  editable = false,
  yesScore,
  optionIndex,
  expanded: expandedFromProps,
}) => {
  const showVotes = !!(selectedParticipantId || editable);
  const [expanded, setExpanded] = React.useState(expandedFromProps);
  const selectorRef = React.useRef<HTMLButtonElement>(null);

  const { toggle } = useVoteSelector(vote);
  React.useEffect(() => {
    if (expandedFromProps !== undefined) {
      setExpanded(expandedFromProps);
    }
  }, [expandedFromProps]);

  return (
    <div
      className={clsx("space-y-4 overflow-hidden px-4 py-4 sm:px-6", {
        "hover:bg-slate-300/10 active:bg-slate-400/10": editable,
      })}
      data-testid="poll-option"
      onClick={() => onChange(toggle())}
    >
      <div className="flex select-none">
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {showVotes ? (
              <motion.div
                layout={true}
                variants={{
                  collapsed: {
                    x: -20,
                    opacity: 0,
                    width: 0,
                  },
                  expanded: {
                    x: 0,
                    opacity: 1,
                    width: "auto",
                  },
                }}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                {editable ? (
                  <VoteSelector
                    className="mr-4"
                    ref={selectorRef}
                    value={vote}
                  />
                ) : (
                  <PopInOut
                    key={vote}
                    className="absolute inset-0 flex h-full items-center justify-center"
                  >
                    <VoteIcon type={vote} />
                  </PopInOut>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.div layout="position" className="flex grow space-x-8">
            <div>{children}</div>
            <div className="flex grow items-center justify-end">
              <button
                type="button"
                onTouchStart={(e) => e.stopPropagation()}
                className="flex justify-end rounded-lg p-2 active:bg-slate-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((value) => !value);
                }}
              >
                <ScoreSummary yesScore={yesScore} />
                <ChevronDown
                  className={clsx("h-5 text-slate-400 transition-transform", {
                    "-rotate-180": expanded,
                  })}
                />
              </button>
            </div>
          </motion.div>
        </LayoutGroup>
      </div>
      {!expanded && participants.length > 0 ? (
        <SummarizedParticipantList
          participants={participants.map(({ name }) => name)}
        />
      ) : null}
      <AnimatePresence initial={false}>
        {expanded ? <PollOptionVoteSummary optionIndex={optionIndex} /> : null}
      </AnimatePresence>
    </div>
  );
};

export default PollOption;
