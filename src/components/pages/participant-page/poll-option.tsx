import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { Button } from "../../button";
import { ScoreSummary } from "../../poll/score-summary";
import VoteIcon from "../../poll/vote-icon";
import { useVoteState, VoteSelector } from "../../poll/vote-selector";
import { useOption, useParticipant, usePoll } from "./poll-context";
import { StyledListItem } from "./styled-list";

const Participant: React.VoidFunctionComponent<{ participantId: string }> = ({
  participantId,
}) => {
  const participant = useParticipant(participantId);
  return (
    <div className="action-group whitespace-nowrap">
      <div
        className={clsx(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-center text-xs text-white/90",
          participant.color,
        )}
      >
        {participant.name[0]}
      </div>
      {participant.name}
    </div>
  );
};

const ParticipantList: React.VoidFunctionComponent<{
  participantIds: string[];
  vote: VoteType;
  className?: string;
}> = ({ className, participantIds, vote }) => {
  if (participantIds.length === 0) {
    return null;
  }
  return (
    <div className={clsx("space-y-3", className)}>
      {participantIds.map((participantId) => {
        return (
          <div key={participantId} className="relative">
            <div
              className={clsx(
                "absolute left-4 -top-1 z-10 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-white",
                {
                  "bg-green-400": vote === "yes",
                  "bg-amber-400": vote === "ifNeedBe",
                  "bg-slate-300": vote === "no",
                },
              )}
            >
              <VoteIcon size="sm" type={vote} />
            </div>
            <Participant participantId={participantId} />
          </div>
        );
      })}
    </div>
  );
};

const VoteSummary: React.VoidFunctionComponent<{ optionId: string }> = ({
  optionId,
}) => {
  const { votes } = usePoll();

  const { yes, ifNeedBe, no } = votes.reduce<Record<VoteType, string[]>>(
    (acc, curr) => {
      if (curr.optionId === optionId) {
        acc[curr.type].push(curr.participantId);
      }
      return acc;
    },
    {
      yes: [],
      ifNeedBe: [],
      no: [],
    },
  );

  return (
    <div className="mt-3 grid grid-cols-2 rounded border bg-white p-3">
      <div className="">
        <ParticipantList participantIds={yes} vote="yes" />
      </div>
      <div className="space-y-2">
        <ParticipantList participantIds={ifNeedBe} vote="ifNeedBe" />
        <ParticipantList participantIds={no} vote="no" />
      </div>
    </div>
  );
};

export const PollOption: React.VoidFunctionComponent<{
  optionId: string;
  vote?: VoteType;
  onChange: (vote: VoteType) => void;
  score?: number;
}> = ({ optionId, vote, score, onChange }) => {
  const { option } = useOption(optionId);
  const { toggle } = useVoteState();
  const [shouldShowParticipants, setShouldShowParticipants] =
    React.useState(false);

  return (
    <div className="">
      <div className="flex">
        <div
          role="button"
          onMouseDown={() => {
            onChange(toggle(vote));
          }}
          className={clsx(
            "flex h-12 grow select-none items-center justify-between gap-3 rounded border bg-white px-3 text-slate-700/90 shadow-sm",
            {
              "border-amber-400 ring-amber-400": vote === "ifNeedBe",
              "border-green-400 ring-green-400": vote === "yes",
              "border-slate-400 ring-slate-400": vote === "no",
              "ring-1": !!vote,
            },
          )}
        >
          <div className="flex items-center gap-3">
            <VoteSelector value={vote} className="pointer-events-none" />
            <StyledListItem {...option} />
          </div>
        </div>
        <div>
          {score !== undefined ? (
            <Button
              className="relative h-full w-16 p-0"
              onClick={() => {
                setShouldShowParticipants(!shouldShowParticipants);
              }}
            >
              <ScoreSummary yesScore={score} />
            </Button>
          ) : null}
        </div>
      </div>
      <AnimatePresence>
        {shouldShowParticipants ? (
          <motion.div
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="overflow-hidden"
          >
            <VoteSummary optionId={optionId} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
