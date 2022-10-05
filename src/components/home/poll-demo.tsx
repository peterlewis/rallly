import { useTranslation } from "next-i18next";
import * as React from "react";

import { useDayjs } from "../../utils/dayjs";
import { GridContext, useGrid } from "../poll/grid-view-poll";
import { ParticipantRowView } from "../poll/grid-view-poll/participant-row";
import { ScoreSummary } from "../poll/score-summary";
import { ScrollSync } from "../scroll-sync";

const participants = [
  {
    name: "Reed",
    color: "bg-sky-400",
    votes: [0, 2],
  },
  {
    name: "Susan",
    color: "bg-blue-400",
    votes: [0, 1, 2],
  },
  {
    name: "Johnny",
    color: "bg-primary-400",
    votes: [2, 3],
  },
  {
    name: "Ben",
    color: "bg-purple-400",
    votes: [0, 1, 2, 3],
  },
];

const options = ["2022-12-14", "2022-12-15", "2022-12-16", "2022-12-17"];

const PollDemo: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("homepage");

  const { ref, props } = useGrid<HTMLDivElement>(4);
  const { dayjs } = useDayjs();

  const { sidebarWidth, columnWidth } = props;
  return (
    <ScrollSync>
      <GridContext.Provider value={props}>
        <div
          ref={ref}
          className="rounded-lg bg-white shadow-huge"
          style={{ width: 600 }}
        >
          <div className="flex border-b">
            <div
              className="flex shrink-0 items-center py-2 pl-4 pr-2 font-medium"
              style={{ width: sidebarWidth }}
            >
              <div className="flex h-full grow items-end">
                {t("participantCount", { count: participants.length })}
              </div>
            </div>
            {options.map((option, i) => {
              const d = new Date(option);
              let score = 0;
              participants.forEach((participant) => {
                if (participant.votes.includes(i)) {
                  score++;
                }
              });
              return (
                <div
                  key={i}
                  className="shrink-0 space-y-3 py-2 pt-3 text-center transition-colors"
                  style={{ width: columnWidth }}
                >
                  <div>
                    <div className="font-semibold leading-9">
                      <div className="text-sm uppercase text-slate-400">
                        {dayjs(d).format("ddd")}
                      </div>
                      <div className="text-2xl">{dayjs(d).format("DD")}</div>
                      <div className="text-xs font-medium uppercase text-slate-400/75">
                        {dayjs(d).format("MMM")}
                      </div>
                    </div>
                  </div>
                  <div>
                    <ScoreSummary yesScore={score} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-500/5">
            {participants.map((participant, i) => (
              <ParticipantRowView
                key={i}
                color={participant.color}
                name={participant.name}
                votes={options.map((_, i) => {
                  return participant.votes.some((vote) => vote === i)
                    ? "yes"
                    : "no";
                })}
              />
            ))}
          </div>
        </div>
      </GridContext.Provider>
    </ScrollSync>
  );
};

export default PollDemo;
