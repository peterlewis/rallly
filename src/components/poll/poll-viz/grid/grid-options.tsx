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
import { useVoteState } from "../../vote-selector";

interface GridPollOptionProps {
  option: PollViewOption;
  suffix?: React.ReactNode;
}
export const GridOption: React.VoidFunctionComponent<GridPollOptionProps> = ({
  option,
  suffix,
}) => {
  const { dayjs } = useDayjs();
  const date = dayjs(option.type === "date" ? option.date : option.start);
  return (
    <div className={clsx("border-r text-center")}>
      <div className="space-y-2 py-3">
        {suffix}
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500/75">
            {date.format("ddd")}
          </div>
          <div className="text-xl font-semibold text-slate-700">
            {date.format("D")}
          </div>
          <div className="text-xs font-medium uppercase text-slate-500/75">
            {date.format("MMM")}
          </div>
          {option.type === "time" ? (
            <div
              className={
                "relative mt-2 -mr-2 inline-block pr-2 text-right  after:absolute after:top-3 after:right-0 after:h-4 after:w-1 after:border-t after:border-r after:border-b after:border-slate-300 after:content-['']"
              }
            >
              <div className="text-sm text-slate-700">
                {dayjs(option.start).format("LT")}
              </div>
              <div className="text-sm text-slate-700/50">
                {dayjs(option.end).format("LT")}
              </div>
            </div>
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
    <div className="flex h-full grow touch-none select-none items-center">
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
  children?: React.ComponentType<{ option: PollViewOption }>;
};

export const GridPollOptionList = ({
  className,
  options,
  children: Component = GridOption,
}: GridPollOptionListProps) => {
  const { hasOverflow, numberOfVisibleColumns, columnWidth } = useGridContext();
  return (
    <div className={clsx("divide-y", className)}>
      {hasOverflow ? (
        <div className="flex h-8 items-center">
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
        {options.map((option, i) => (
          <div key={i} className="shrink-0" style={{ width: columnWidth }}>
            <Component option={option} />
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
  const renderOption = React.useCallback(
    ({ option }: GridPollOptionProps) => {
      const vote = value[option.id];
      return (
        <div className="h-full">
          <GridOption option={option} suffix={<VoteIcon type={vote} />} />
        </div>
      );
    },
    [value],
  );
  return (
    <GridPollOptionList options={options}>{renderOption}</GridPollOptionList>
  );
};

export const GridPollOptionsListInput: React.VoidFunctionComponent<{
  value?: PollValue;
  onChange: (value: PollValue) => void;
  options: PollViewOption[];
}> = ({ value = {}, onChange, options }) => {
  const { toggle } = useVoteState();
  const renderOption = React.useCallback(
    ({ option }: GridPollOptionProps) => {
      const vote = value[option.id];
      return (
        <div
          role="button"
          className="h-full hover:bg-slate-500/5 active:bg-slate-500/10"
          onClick={() => {
            onChange({
              ...value,
              [option.id]: toggle(value[option.id]),
            });
          }}
        >
          <GridOption option={option} suffix={<VoteIcon type={vote} />} />
        </div>
      );
    },
    [onChange, toggle, value],
  );
  return (
    <GridPollOptionList options={options}>{renderOption}</GridPollOptionList>
  );
};
