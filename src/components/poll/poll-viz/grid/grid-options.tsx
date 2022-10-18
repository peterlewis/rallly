import clsx from "clsx";
import { toInteger } from "lodash";
import { useTranslation } from "next-i18next";
import React from "react";

import ArrowLeft from "@/components/icons/arrow-left.svg";
import ArrowRight from "@/components/icons/arrow-right.svg";

import { useDayjs } from "../../../../utils/dayjs";
import { CustomScrollbar } from "../../../custom-scrollbar";
import { ScrollSyncPane, useScrollSync } from "../../../scroll-sync";
import { useGridContext } from "../../grid-view-poll";
import { PollValue, PollViewOption } from "../../types";
import VoteIcon from "../../vote-icon";
import { useVoteState, VoteSelector } from "../../vote-selector";

interface GridPollOptionProps {
  option: PollViewOption;
  suffix?: React.ReactNode;
}

export const TimeRange: React.VoidFunctionComponent<{
  className?: string;
  start: string;
  end: string;
}> = ({ className, start, end }) => {
  return (
    <div
      className={clsx(
        "relative mt-2 -mr-2 inline-block pr-2 text-right font-semibold",
        className,
      )}
    >
      <div className="absolute top-3 right-0 h-4 w-1 border-t border-r border-b border-slate-300 content-['']" />
      <div className="text-sm text-primary-500/90">{start}</div>
      <div className="text-sm text-slate-400">{end}</div>
    </div>
  );
};

export const GridOption: React.VoidFunctionComponent<GridPollOptionProps> = ({
  option,
  suffix,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(option.type === "date" ? option.date : option.start);
  return (
    <div className={clsx("text-center")}>
      <div className="space-y-2 py-3">
        {suffix ? (
          <div className="flex h-7 items-center justify-center">{suffix}</div>
        ) : null}
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500/90">
            {date.format("ddd")}
          </div>
          <div className="text-xl font-semibold text-slate-600">
            {date.format("D")}
          </div>
          <div className="text-xs font-medium uppercase text-slate-500/75">
            {date.format("MMM")}
          </div>
          {option.type === "time" ? (
            <TimeRange
              start={option.start.format("LT")}
              end={option.end.format("LT")}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const NavigationControl: React.VoidFunctionComponent<{
  step: number;
  count: number;
  maxValue: number;
}> = ({ count, step, maxValue }) => {
  const { left, setScroll } = useScrollSync();
  const { t } = useTranslation("app");
  const hasReachedEnd = left >= maxValue;
  const didNotScroll = left === 0;
  return (
    <div className="flex h-full grow touch-none select-none items-center border-b border-white bg-gray-200/30 p-2">
      <div className="grow px-3">
        <CustomScrollbar
          value={left}
          min={0}
          step={step}
          max={maxValue}
          onValueChange={([newLeft]) => {
            setScroll(newLeft);
          }}
          className="w-full"
        />
      </div>
      <div className="whitespace-nowrap text-sm font-medium text-slate-500">
        {t("optionCount", { count })}
      </div>
      <div className="ml-2 flex h-full items-center space-x-1 pr-1">
        <button
          className={clsx(
            "inline-flex h-6 w-7 items-center justify-center rounded",
            {
              "text-slate-500 hover:bg-slate-500/5 active:bg-slate-500/10":
                !didNotScroll,
              "text-slate-500/50": didNotScroll,
            },
          )}
          disabled={didNotScroll}
          type="button"
          onClick={() => {
            setScroll(Math.max(0, Math.round(left / step) * step - step));
          }}
        >
          <ArrowLeft className="h-4" />
        </button>
        <button
          className={clsx(
            "inline-flex h-6 w-7 items-center justify-center rounded",
            {
              "text-slate-500 hover:bg-slate-500/5 active:bg-slate-500/10":
                !hasReachedEnd,
              "text-slate-500/50": hasReachedEnd,
            },
          )}
          type="button"
          disabled={hasReachedEnd}
          onClick={() => {
            setScroll(
              Math.min(maxValue, Math.round(left / step) * step + step),
            );
          }}
        >
          <ArrowRight className="h-4" />
        </button>
      </div>
    </div>
  );
};

type GridPollOptionListProps = {
  className?: string;
  options: PollViewOption[];
  children?: (props: { option: PollViewOption }) => JSX.Element;
};

export const GridPollOptionList = ({
  className,
  options,
  children,
}: GridPollOptionListProps) => {
  const { hasOverflow, numberOfVisibleColumns, columnWidth } = useGridContext();
  return (
    <div className={clsx(className)}>
      {hasOverflow ? (
        <div className="flex items-center">
          <NavigationControl
            step={columnWidth}
            maxValue={(options.length - numberOfVisibleColumns) * columnWidth}
            count={options.length}
          />
        </div>
      ) : null}
      <ScrollSyncPane
        className="no-scrollbar flex overflow-y-auto"
        style={{
          width: numberOfVisibleColumns * columnWidth,
        }}
      >
        {options.map((option) => (
          <div
            key={option.id}
            className="shrink-0"
            style={{ width: columnWidth }}
          >
            {children ? children({ option }) : <GridOption option={option} />}
          </div>
        ))}
      </ScrollSyncPane>
    </div>
  );
};

export const GridPollOptionsListValue: React.VoidFunctionComponent<{
  value?: PollValue;
  options: PollViewOption[];
}> = ({ value = {}, options }) => {
  return (
    <GridPollOptionList options={options}>
      {({ option }: GridPollOptionProps) => {
        const vote = value[option.id];
        return (
          <div className="h-full">
            <GridOption option={option} suffix={<VoteIcon type={vote} />} />
          </div>
        );
      }}
    </GridPollOptionList>
  );
};

export const GridPollOptionsListInput: React.VoidFunctionComponent<{
  value?: PollValue;
  onChange: (value: PollValue) => void;
  options: PollViewOption[];
}> = ({ value = {}, onChange, options }) => {
  const { toggle } = useVoteState();
  const renderOption = ({ option }: GridPollOptionProps) => {
    const vote = value[option.id];
    return (
      <div
        role="button"
        className={clsx("h-full hover:bg-slate-500/5 active:bg-slate-500/10", {
          "border-t-transparent": !vote,
          // "bg-green-100/50": vote === "yes",
          // "bg-amber-100  ": vote === "ifNeedBe",
          // "border-t-slate-300 ": vote === "no",
        })}
        onClick={() => {
          onChange({
            ...value,
            [option.id]: toggle(value[option.id]),
          });
        }}
      >
        <GridOption
          option={option}
          suffix={<VoteSelector className="pointer-events-none" value={vote} />}
        />
      </div>
    );
  };
  return (
    <GridPollOptionList options={options}>{renderOption}</GridPollOptionList>
  );
};
