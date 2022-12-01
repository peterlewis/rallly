import { VoteType } from "@prisma/client";
import clsx from "clsx";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import React from "react";

import { useDayjs } from "../../../../utils/dayjs";
import { DonutScore } from "../../../donut-score";
import {
  useOption,
  useOptions as useAllOptions,
  useParticipant,
  useParticipants,
  useVote,
  useVotes,
} from "../../participant-page/poll-context";
import { ResultsConfigProvider, useResultsConfig } from "./results/context";
import { OrderByControl } from "./results/order-by-control";

const useOptions = () => {
  const [{ limitNumberOfOptions, orderBy }] = useResultsConfig();
  const options = useAllOptions();
  const { getScoreForOption } = useVotes();

  const sorted = React.useMemo(() => {
    if (orderBy === "popularity") {
      return [...options].sort(
        (a, b) => getScoreForOption(b.id) - getScoreForOption(a.id),
      );
    }
    return options;
  }, [getScoreForOption, options, orderBy]);

  if (limitNumberOfOptions) {
    return sorted.slice(0, limitNumberOfOptions);
  }

  return options;
};

const Cell = (
  props: React.PropsWithChildren<{
    className?: string;
    vote?: VoteType;
  }>,
) => {
  return (
    <div
      className={clsx(
        "flex w-20 grow items-center justify-center rounded border shadow-sm",
        {
          "border-green-500/20 bg-green-50 text-green-500":
            props.vote === "yes",
          "border-orange-500/20 bg-orange-50 text-orange-500":
            props.vote === "ifNeedBe",
          "border-slate-500/10 bg-slate-50 text-slate-500": props.vote === "no",
        },
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};

const Option = (props: { optionId: string }) => {
  const { option } = useOption(props.optionId);
  const { dayjs } = useDayjs();
  if (option.duration > 0) {
    return (
      <div>
        <div>
          <div className="text-xs opacity-75">
            {dayjs(option.start).format("D MMM")}
          </div>
          <div className="font-semibold">
            {dayjs(option.start).format("LT")}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="text-center">
        <div>
          <div className="text-xs opacity-75">
            {dayjs(option.start).format("MMM YYYY")}
          </div>
          <div className="font-semibold">
            {dayjs(option.start).format("D ddd")}
          </div>
        </div>
      </div>
    );
  }
};

const Vote = (props: { participantId: string; optionId: string }) => {
  const vote = useVote(props.optionId, props.participantId);
  return (
    <Cell vote={vote?.type}>
      <Option optionId={props.optionId} />
    </Cell>
  );
};

const Row = (props: { participantId: string }) => {
  const participant = useParticipant(props.participantId);
  const options = useOptions();

  return (
    <div className="flex h-16 w-fit min-w-full grow gap-2">
      {options.map((option) => {
        return (
          <Vote
            optionId={option.id}
            participantId={participant.id}
            key={option.id}
          />
        );
      })}
    </div>
  );
};

const Score = (props: { optionId: string }) => {
  const { getVotesForOption } = useVotes();
  const { votesByType } = getVotesForOption(props.optionId);

  return (
    <Cell className="h-28 rounded-t-md">
      <div className="flex flex-col items-center space-y-3">
        <DonutScore
          yes={votesByType.yes.length}
          ifNeedBe={votesByType.ifNeedBe.length}
          no={votesByType.no.length}
        />
        <Option optionId={props.optionId} />
      </div>
    </Cell>
  );
};

const ScoreRow = () => {
  const options = useOptions();
  return (
    <div className="flex w-fit min-w-full gap-2">
      <div className="flex grow gap-2">
        {options.map((option) => (
          <Score key={option.id} optionId={option.id} />
        ))}
      </div>
    </div>
  );
};

const Sidebar = (props: { className?: string }) => {
  const { participants } = useParticipants();
  const { t } = useTranslation("app");
  return (
    <div className={props.className}>
      <div className="flex h-28 flex-col justify-between pb-3">
        <OrderByControl />
        <div className="font-semibold">
          {t("participantCount", { count: participants.length })}
        </div>
      </div>
      {participants.map((participant) => {
        return (
          <div key={participant.id} className="flex h-16 items-center">
            <div>
              <div>{participant.name}</div>
              <div className="text-sm text-slate-400">
                Responded {dayjs(participant.createdAt).fromNow()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Results = () => {
  const { participants } = useParticipants();
  return (
    <ResultsConfigProvider
      initialValue={{
        limitNumberOfOptions: 6,
        orderBy: "date",
      }}
    >
      <div className="divide-y rounded-md border">
        <div className="flex">
          <Sidebar className="space-y-2 p-4" />
          <div className="grow space-y-2 p-4">
            <ScoreRow />
            {participants.map((participant) => {
              return (
                <Row key={participant.id} participantId={participant.id} />
              );
            })}
          </div>
        </div>
      </div>
    </ResultsConfigProvider>
  );
};
