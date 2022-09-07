import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { string } from "zod";

import ArrowLeft from "@/components/icons/arrow-left.svg";
import ArrowRight from "@/components/icons/arrow-right.svg";

import { useDayjs } from "../../../utils/dayjs";
import { useFormValidation } from "../../../utils/form-validation";
import { Button } from "../../button";
import NameInput from "../../name-input";
import { SegmentedButton, SegmentedButtonGroup } from "../../segmented-button";
import { Sticky } from "../../sticky";
import { TextInput } from "../../text-input";
import { ScoreSummary } from "../score-summary";
import { ParticipantForm, PollViewOption } from "../types";
import UserAvatar from "../user-avatar";
import { VoteSelector } from "../vote-selector";
import ControlledScrollArea from "./controlled-scroll-area";
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

const PollOption: React.VFC<{
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
    <div className="shrink-0 py-2 px-1 text-center " style={{ width }}>
      <div
        role={editing ? "button" : undefined}
        onClick={() => {
          voteSelectorRef.current?.click();
        }}
        className={clsx(
          "space-y-3 rounded-md border bg-white py-4",
          editing
            ? {
                "shadow-sm active:bg-slate-500/10 active:shadow-none": true,
                "border-green-300 bg-green-400/5  active:bg-green-400/10":
                  value === "yes",
                "border-amber-300 bg-amber-400/5 active:bg-amber-400/10":
                  value === "ifNeedBe",
                "bg-slate-500/5": value === "no",
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
          <TimeRange
            className="mt-3"
            startTime={option.start}
            endTime={option.end}
          />
        ) : null}
        <div className="flex h-7 items-end justify-center">
          {editing ? (
            <VoteSelector
              ref={voteSelectorRef}
              value={value}
              onChange={onChange}
            />
          ) : (
            <ScoreSummary yesScore={option.score} />
          )}
        </div>
      </div>
    </div>
  );
};

const PollHeader: React.VoidFunctionComponent<{
  options: Array<PollViewOption>;
  participantCount: number;
  onSubmit?: (data: ParticipantForm) => Promise<void>;
  onCancel?: () => void;
}> = ({ options, participantCount, onCancel, onSubmit }) => {
  const { t } = useTranslation("app");
  const { requiredString } = useFormValidation();
  const {
    goToNextPage,
    scrollPosition,
    maxScrollPosition,
    goToPreviousPage,
    numberOfColumns,
    columnWidth,
    sidebarWidth,
    isEditing,
  } = usePollContext();

  const { control, reset, handleSubmit, formState } =
    useFormContext<ParticipantForm>();

  const checkboxRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const renderPageControl = () => {
    return (
      <div className="flex items-center">
        <div className="flex px-6 text-sm font-medium text-slate-500">
          {t("optionCount", { count: options.length })}
        </div>
        {numberOfColumns < options.length ? (
          <SegmentedButtonGroup>
            <SegmentedButton
              onClick={goToPreviousPage}
              disabled={scrollPosition === 0}
            >
              <ArrowLeft className="h-4" />
            </SegmentedButton>
            <SegmentedButton
              onClick={goToNextPage}
              disabled={scrollPosition >= maxScrollPosition}
            >
              <ArrowRight className="h-4" />
            </SegmentedButton>
          </SegmentedButtonGroup>
        ) : null}
      </div>
    );
  };

  return (
    <Sticky
      top={48}
      className={(isPinned) =>
        clsx("z-20 rounded-t-md border-b bg-white/75 backdrop-blur-md", {
          "border-transparent": !isPinned,
        })
      }
    >
      <form onSubmit={handleSubmit((data) => onSubmit?.(data))}>
        <div className="flex h-14 items-center justify-end space-x-3 rounded-t-md border-b bg-slate-500/5 px-3">
          {isEditing ? (
            <div className="flex space-x-3">
              <div className="space-x-3">
                <Button onClick={onCancel}>{t("cancel")}</Button>
                <Button htmlType="submit" type="primary">
                  {t("save")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex">
          <div
            className="shrink-0 pt-4 pb-3 pl-5 pr-4 font-medium"
            style={{ width: sidebarWidth }}
          >
            {isEditing ? (
              <div>
                <div className="mb-2">Enter your name</div>
                <div className="space-y-4">
                  <Controller
                    name="name"
                    rules={{
                      validate: requiredString(t("name")),
                    }}
                    render={({ field }) => (
                      <div className="w-full">
                        <TextInput
                          className={clsx("w-full", {
                            "input-error":
                              formState.errors.name &&
                              formState.submitCount > 0,
                          })}
                          autoFocus={true}
                          placeholder={t("yourName")}
                          {...field}
                          onKeyDown={(e) => {
                            if (
                              (e.code === "Tab" || e.code === "Enter") &&
                              scrollPosition > 0
                            ) {
                              e.preventDefault();
                              // setScrollPosition(0);
                              // setTimeout(() => {
                              //   checkboxRefs.current[0]?.focus();
                              // }, 100);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.code === "Enter") {
                              e.preventDefault();
                              // checkboxRefs.current[0]?.focus();
                            }
                          }}
                        />
                      </div>
                    )}
                    control={control}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-end pb-3">
                {t("participantCount", { count: participantCount })}
              </div>
            )}
          </div>
          <Controller
            control={control}
            name="votes"
            render={({ field }) => (
              <ControlledScrollArea>
                {options.map((option, index) => (
                  <PollOption
                    key={index}
                    option={option}
                    width={columnWidth}
                    editing={isEditing}
                    value={field.value[index]}
                    onChange={(vote) => {
                      const newValue = [...field.value];
                      newValue[index] = vote;
                      field.onChange(newValue);
                    }}
                  />
                ))}
              </ControlledScrollArea>
            )}
          />
        </div>
      </form>
    </Sticky>
  );
};

export default PollHeader;
