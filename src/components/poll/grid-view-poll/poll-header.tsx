import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";

import ArrowLeft from "@/components/icons/chevron-left.svg";
import ArrowRight from "@/components/icons/chevron-right.svg";

import { participants } from "../../../server/routers/polls/participants";
import { useDayjs } from "../../../utils/dayjs";
import { useFormValidation } from "../../../utils/form-validation";
import { Button } from "../../button";
import CompactButton from "../../compact-button";
import Dropdown from "../../dropdown";
import { ScrollSyncPane, useScrollSync } from "../../scroll-sync";
import { Sticky } from "../../sticky";
import GridViewPoll from "../grid-view-poll";
import { ScoreSummary } from "../score-summary";
import { PollValue, PollViewOption, PollViewParticipant } from "../types";
import UserAvatar from "../user-avatar";
import { VoteSelector } from "../vote-selector";
import { usePollContext } from "./poll-context";

const TimeRange: React.VoidFunctionComponent<{
  startTime: string;
  endTime: string;
  className?: string;
}> = ({ startTime, endTime, className }) => {
  const { dayjs } = useDayjs();
  return (
    <div
      className={clsx(
        "relative -mr-2 inline-block pr-2 text-right text-xs after:absolute after:top-2 after:right-0 after:h-4 after:w-1 after:border-t after:border-r after:border-b after:border-slate-300 after:content-['']",
        className,
      )}
    >
      <div className="text-slate-600">{dayjs(startTime).format("LT")}</div>
      <div className="text-slate-400">{dayjs(endTime).format("LT")}</div>
    </div>
  );
};

export const PollOption: React.VFC<{
  width: number;
  option: PollViewOption;
  value?: VoteType;
  onChange?: (value: VoteType) => void;
  editing?: boolean;
}> = ({ option, width, editing, value, onChange }) => {
  const { dayjs } = useDayjs();
  const date = dayjs(option.type === "date" ? option.date : option.start);
  const voteSelectorRef = React.useRef<HTMLButtonElement>(null);
  return (
    <div
      className="shrink-0 select-none pt-2 pr-2 text-center "
      style={{ width }}
    >
      <div
        role={editing ? "button" : undefined}
        onClick={() => {
          voteSelectorRef.current?.click();
        }}
        className={clsx(
          "space-y-3 rounded-md border py-3",
          editing
            ? {
                "shadow-sm active:bg-slate-500/10 active:shadow-none": true,
                "border-green-300 bg-green-400/5  active:bg-green-400/10":
                  value === "yes",
                "border-amber-300 bg-amber-400/5 active:bg-amber-400/10":
                  value === "ifNeedBe",
                "bg-slate-50": value === "no",
                "hover:bg-slate-500/5": !value,
              }
            : "border-transparent",
        )}
      >
        <div>
          <div className="leading-9">
            <div className="text-xs font-semibold uppercase text-slate-500/75">
              {date.format("ddd")}
            </div>
            <div className="text-2xl font-semibold text-slate-700">
              {date.format("D")}
            </div>
            <div className="text-xs font-medium uppercase text-slate-500/75">
              {date.format("MMM")}
            </div>
          </div>
        </div>
        {option.type === "time" ? (
          <TimeRange startTime={option.start} endTime={option.end} />
        ) : null}
        {editing ? (
          <div className="flex h-6 items-end justify-center">
            <VoteSelector
              ref={voteSelectorRef}
              value={value}
              onChange={onChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const PollHeader: React.VoidFunctionComponent<{
  options: Array<PollViewOption>;
  participantCount: number;
  value?: PollValue;
  onChange?: (value: PollValue) => void;
}> = ({ options, participantCount, value, onChange }) => {
  const { t } = useTranslation("app");
  const { numberOfColumns, columnWidth, sidebarWidth, isEditing } =
    usePollContext();

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const { setScroll } = useScrollSync();
  return (
    <Sticky
      top={48}
      className={(isPinned) =>
        clsx("group z-20 rounded-t-md border-b bg-white/75 backdrop-blur-md", {
          "border-transparent": !isPinned,
        })
      }
    >
      <div>
        {numberOfColumns < options.length && (
          <div className="flex items-center justify-end space-x-3 px-3 pb-2 pt-4">
            <div className="font-medium text-slate-500">
              {t("optionCount", { count: options.length })}
            </div>
            <div className="ml-4 space-x-2">
              <CompactButton
                icon={ArrowLeft}
                onClick={() => {
                  const scrollableElement = scrollAreaRef.current;
                  if (!scrollableElement) {
                    return;
                  }

                  setScroll(
                    Math.round(scrollableElement.scrollLeft / columnWidth) *
                      columnWidth -
                      columnWidth,
                  );
                }}
              />
              <CompactButton
                icon={ArrowRight}
                onClick={() => {
                  const scrollableElement = scrollAreaRef.current;
                  if (!scrollableElement) {
                    return;
                  }

                  setScroll(
                    Math.round(scrollableElement.scrollLeft / columnWidth) *
                      columnWidth +
                      columnWidth,
                  );
                }}
              />
            </div>
          </div>
        )}
        <div className="relative flex">
          <div
            className="absolute h-full shrink-0 py-3 px-4 font-medium"
            style={{ width: sidebarWidth }}
          >
            {!isEditing ? (
              <div className="flex h-full items-end">
                {t("participantCount", { count: participantCount })}
              </div>
            ) : (
              <>
                <div className="mb-2">Select your availability</div>
                <div>
                  <UserAvatar name={t("you")} showName />
                </div>
              </>
            )}
          </div>
          <ScrollSyncPane
            ref={scrollAreaRef}
            className={clsx("no-scrollbar flex overflow-y-auto")}
            style={{
              marginLeft: sidebarWidth,
            }}
          >
            {options.map((option, index) => (
              <PollOption
                key={index}
                option={option}
                width={columnWidth}
                editing={isEditing}
                value={value?.[option.id]}
                onChange={(vote) => {
                  const newValue = { ...value };
                  newValue[option.id] = vote;
                  onChange?.(newValue);
                }}
              />
            ))}
          </ScrollSyncPane>
        </div>
      </div>
    </Sticky>
  );
};

export default PollHeader;
