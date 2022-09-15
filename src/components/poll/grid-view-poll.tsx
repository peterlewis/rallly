import { Participant, Vote, VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useMeasure } from "react-use";

import ArrowLeft from "@/components/icons/arrow-left.svg";
import ArrowRight from "@/components/icons/arrow-right.svg";
import Plus from "@/components/icons/plus-sm.svg";

import poll from "../../pages/poll";
import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { useDayjs } from "../../utils/dayjs";
import { trpc } from "../../utils/trpc";
import { PollOption } from "../../utils/trpc/types";
import { Button } from "../button";
import CompactButton from "../compact-button";
import { CustomScrollbar } from "../custom-scrollbar";
import Dropdown, { DropdownItem } from "../dropdown";
import { usePoll } from "../poll-provider";
import { ScrollSync, ScrollSyncPane, useScrollSync } from "../scroll-sync";
import { Sticky } from "../sticky";
import { useUser } from "../user-provider";
import ParticipantRow, {
  ParticipantRowView,
} from "./grid-view-poll/participant-row";
import PollHeader from "./grid-view-poll/poll-header";
import { ScoreSummary } from "./score-summary";
import {
  PollProps,
  PollValue,
  PollViewOption,
  PollViewParticipant,
} from "./types";
import { useDeleteParticipantModal } from "./use-delete-participant-modal";
import UserAvatar from "./user-avatar";
import { useVoteState, VoteSelector } from "./vote-selector";

const useGrid = (columns: number) => {
  const minSidebarWidth = 220;

  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const availableSpace = width - minSidebarWidth;

  const columnWidth = Math.min(Math.max(90, availableSpace / columns), 100);

  const numberOfVisibleColumns = Math.min(
    columns,
    Math.floor((width - minSidebarWidth) / columnWidth),
  );

  const sidebarWidth = Math.min(
    300,
    width - numberOfVisibleColumns * columnWidth,
  );

  return { ref, width, sidebarWidth, numberOfVisibleColumns, columnWidth };
};

const GridViewPoll: React.VoidFunctionComponent<PollProps> = ({
  options,
  participants,
  value,
  onChange,
}) => {
  const { t } = useTranslation("app");

  const { ref, sidebarWidth, numberOfVisibleColumns, columnWidth } = useGrid(
    options.length,
  );

  const [activeOptionId, setActiveOptionId] =
    React.useState<string | null>(null);

  const [scrollPosition, setScrollPosition] = React.useState(0);

  const maxScrollPosition =
    columnWidth * options.length - columnWidth * numberOfVisibleColumns;

  const goToNextPage = () => {
    setScrollPosition(
      Math.min(
        maxScrollPosition,
        scrollPosition + numberOfVisibleColumns * columnWidth,
      ),
    );
  };

  const goToPreviousPage = () => {
    setScrollPosition(
      Math.max(0, scrollPosition - numberOfVisibleColumns * columnWidth),
    );
  };

  return (
    <PollContext.Provider
      value={{
        activeOptionId,
        setActiveOptionId,
        scrollPosition,
        setScrollPosition,
        columnWidth,
        sidebarWidth,
        goToNextPage,
        goToPreviousPage,
        numberOfColumns: numberOfVisibleColumns,
        maxScrollPosition,
        isEditing: false,
      }}
    >
      <ScrollSync>
        <div ref={ref}>
          <PollHeader
            value={value}
            onChange={onChange}
            participantCount={participants.length}
            options={options}
          />
          {participants.length > 0 ? (
            <div className="mt-2 border-t bg-slate-400/5 py-2">
              <ScrollSyncPane
                className="no-scrollbar overflow-x-auto overflow-y-hidden"
                style={{ marginLeft: sidebarWidth }}
              >
                {participants.map((participant, i) => {
                  return (
                    <ParticipantRow
                      key={i}
                      options={options}
                      name={participant.name}
                      votes={participant.votes}
                    />
                  );
                })}
                <div className="mt-3 mb-2 flex">
                  {options.map((option) => {
                    return (
                      <div
                        className="shrink-0 text-center"
                        key={option.id}
                        style={{ width: columnWidth }}
                      >
                        <ScoreSummary yesScore={option.score} />
                      </div>
                    );
                  })}
                </div>
              </ScrollSyncPane>
            </div>
          ) : null}
        </div>
      </ScrollSync>
    </PollContext.Provider>
  );
};

export default GridViewPoll;

const NavigationControl: React.VoidFunctionComponent<{
  step: number;
  count: number;
  maxValue: number;
}> = ({ count, step, maxValue }) => {
  const { left, setScroll } = useScrollSync();
  const { t } = useTranslation("app");

  return (
    <div className="flex grow touch-none select-none items-center space-x-4">
      <div className="grow">
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
      <div className="whitespace-nowrap font-medium text-slate-400">
        {t("optionCount", { count })}
      </div>
      <div className="ml-4 flex space-x-2">
        <CompactButton
          icon={ArrowLeft}
          onClick={() => {
            setScroll(Math.max(0, Math.round(left / step) * step - step));
          }}
        />
        <CompactButton
          icon={ArrowRight}
          onClick={() => {
            setScroll(
              Math.min(maxValue, Math.round(left / step) * step + step),
            );
          }}
        />
      </div>
    </div>
  );
};

const GridPoll: React.VoidFunctionComponent<{
  sidebar?: React.ReactNode;
  renderOption: React.FunctionComponent<{ option: PollViewOption }>;
}> = ({ sidebar, renderOption }) => {
  const {
    options,
    entries,
    onEditParticipant,
    onDeleteParticipant,
    onChangeName,
  } = usePollContext();
  const { ref, columnWidth, sidebarWidth, numberOfVisibleColumns } = useGrid(
    options.length,
  );

  return (
    <ScrollSync>
      <div ref={ref}>
        <Sticky
          top={48}
          className={(isPinned) =>
            clsx(
              "group z-20 rounded-t-md border-b bg-white/75 backdrop-blur-md",
              {
                "border-gray-100": !isPinned,
                "shadow-[0_3px_3px_0px_rgba(0,0,0,0.02)]": isPinned,
              },
            )
          }
        >
          {numberOfVisibleColumns < options.length ? (
            <div className="flex items-center pb-1 pt-3">
              <div style={{ width: sidebarWidth }}></div>
              <div className="grow pr-3">
                <NavigationControl
                  step={columnWidth}
                  maxValue={
                    (options.length - numberOfVisibleColumns) * columnWidth
                  }
                  count={options.length}
                />
              </div>
            </div>
          ) : null}
          <div className="flex">
            <div
              className="p shrink-0 p-4 pb-4"
              style={{ width: sidebarWidth }}
            >
              {sidebar}
            </div>
            <ScrollSyncPane className="no-scrollbar flex overflow-y-auto py-2">
              {options.map((option, i) => (
                <div
                  key={i}
                  className="shrink-0 pr-2"
                  style={{ width: columnWidth }}
                >
                  {renderOption({ option })}
                </div>
              ))}
            </ScrollSyncPane>
          </div>
        </Sticky>

        <div className="bg-slate-400/5 py-2">
          <ScrollSyncPane
            className="no-scrollbar overflow-x-auto overflow-y-hidden"
            style={{ marginLeft: sidebarWidth }}
          >
            {entries.map((entry) => {
              return (
                <div key={entry.id}>
                  <ParticipantRowView
                    name={entry.name}
                    votes={entry.votes}
                    sidebarWidth={sidebarWidth}
                    columnWidth={columnWidth}
                    onEdit={
                      onEditParticipant
                        ? () => onEditParticipant(entry.id)
                        : undefined
                    }
                    onDelete={
                      onDeleteParticipant
                        ? () => onDeleteParticipant(entry.id)
                        : undefined
                    }
                    onChangeName={
                      onChangeName ? () => onChangeName(entry.id) : undefined
                    }
                  />
                </div>
              );
            })}
          </ScrollSyncPane>
        </div>
      </div>
    </ScrollSync>
  );
};

const GridPollOption: React.VoidFunctionComponent<{
  className?: string;
  option: PollViewOption;
  children?: React.ReactNode;
}> = ({ option, className, children }) => {
  const { dayjs } = useDayjs();
  const date = dayjs(option.type === "date" ? option.date : option.start);
  return (
    <div className={clsx("space-y-2 text-center", className)}>
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
      {option.type === "time" ? (
        <div
          className={
            "relative -mr-2 inline-block pr-2 text-right text-xs after:absolute after:top-2 after:right-0 after:h-4 after:w-1 after:border-t after:border-r after:border-b after:border-slate-300 after:content-['']"
          }
        >
          <div className="font-bold text-slate-500">
            {dayjs(option.start).format("LT")}
          </div>
          <div className="text-slate-400">{dayjs(option.end).format("LT")}</div>
        </div>
      ) : null}
      <div className="flex h-7 items-end justify-center">{children}</div>
    </div>
  );
};

const GridPollInputOption: React.VoidFunctionComponent<{
  option: PollViewOption;
  value: VoteType | undefined;
  onChange: (value: VoteType) => void;
}> = ({ option, value, onChange }) => {
  const { toggle } = useVoteState(value);
  return (
    <div
      role="button"
      className={clsx(
        "rounded-md border border-t-8 py-3 text-center transition-all",
        {
          "shadow-sm active:bg-slate-500/10 active:shadow-none": true,
          " border-green-300 border-t-green-400 bg-green-400/5  active:bg-green-400/10":
            value === "yes",
          " border-amber-300 border-t-amber-300 bg-amber-400/5 active:bg-amber-400/10":
            value === "ifNeedBe",
          "bg-slate-50": value === "no",
          "hover:bg-slate-500/5": !value,
        },
      )}
      onClick={() => {
        onChange(toggle());
      }}
    >
      <GridPollOption option={option}>
        <VoteSelector value={value} />
      </GridPollOption>
    </div>
  );
};

const GridPollInput: React.VoidFunctionComponent<{
  name?: string;
  value: PollValue;
  onChange: (value: PollValue) => void;
}> = ({ name, value, onChange }) => {
  const { t } = useTranslation("app");
  return (
    <GridPoll
      sidebar={
        <div>
          <div className="mb-2 font-medium">{t("selectAvailability")}</div>
          <div>
            <UserAvatar name={name ?? t("you")} showName={true} />
          </div>
        </div>
      }
      renderOption={({ option }) => {
        return (
          <GridPollInputOption
            option={option}
            value={value[option.id]}
            onChange={(vote) => {
              const newValue = { ...value };
              newValue[option.id] = vote;
              onChange(newValue);
            }}
          />
        );
      }}
    />
  );
};

const PollInput: React.VoidFunctionComponent<{
  name?: string;
  options: PollViewOption[];
  entries: PollViewParticipant[];
  view: "grid" | "list";
  value: PollValue;
  onChange: (value: PollValue) => void;
}> = ({ view, ...rest }) => {
  if (view === "grid") {
    return <GridPollInput {...rest} />;
  } else {
    return null;
  }
};

const GridPollResultsOption: React.VoidFunctionComponent<{
  option: PollViewOption;
}> = ({ option }) => {
  return (
    <div className="border border-transparent pt-5 pb-2">
      <GridPollOption option={option}>
        <ScoreSummary yesScore={option.score} />
      </GridPollOption>
    </div>
  );
};

const GridPollResults = () => {
  const { onAddParticipant, entries } = usePollContext();
  const { t } = useTranslation("app");
  return (
    <GridPoll
      renderOption={GridPollResultsOption}
      sidebar={
        <div className="flex h-full items-end">
          <div className="flex items-center space-x-2">
            <div className="font-medium">
              {t("participantCount", {
                count: entries.length,
              })}
            </div>
            <CompactButton
              icon={Plus}
              disabled={!onAddParticipant}
              onClick={onAddParticipant}
            />
          </div>
        </div>
      }
    />
  );
};

const PollResults: React.VoidFunctionComponent = () => {
  const { view } = usePollContext();
  if (view === "grid") {
    return <GridPollResults />;
  } else {
    return null;
  }
};

const EditParticipantForm: React.VoidFunctionComponent<{
  participant: PollViewParticipant;
  onDone: () => void;
}> = ({ participant, onDone }) => {
  const { poll } = usePoll();
  const { options, entries, view } = usePollContext();
  const { t } = useTranslation("app");
  const { handleSubmit, control, formState } = useForm<{ votes: PollValue }>({
    defaultValues: {
      votes: participant.voteByOptionId,
    },
  });
  const queryClient = trpc.useContext();
  const updateParticipant = trpc.useMutation("polls.participants.update", {
    onSuccess: (participant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: participant.pollId }],
        (existingParticipants = []) => {
          const newParticipants = [...existingParticipants];

          const index = newParticipants.findIndex(
            ({ id }) => id === participant.id,
          );

          if (index !== -1) {
            newParticipants[index] = participant;
          }

          return newParticipants;
        },
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async ({ votes }) => {
        // update votes for participantId
        await updateParticipant.mutateAsync({
          pollId: poll.id,
          participantId: participant.id,
          votes: options.map((option) => ({
            optionId: option.id,
            type: votes[option.id] ?? "no",
          })),
        });
        onDone();
      })}
    >
      <Controller
        name="votes"
        control={control}
        render={({ field }) => {
          return (
            <PollInput
              name={participant.name}
              view={view}
              options={options}
              entries={entries}
              value={field.value}
              onChange={field.onChange}
            />
          );
        }}
      />
      <div className="flex justify-between space-x-3 p-3">
        <Button onClick={onDone}>{t("cancel")}</Button>
        <Button
          loading={formState.isSubmitting}
          htmlType="submit"
          type="primary"
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
};

const NewEntryForm: React.VoidFunctionComponent<{
  onDone: () => void;
}> = ({ onDone }) => {
  const { options, entries, view } = usePollContext();
  const { t } = useTranslation("app");
  const { handleSubmit, control } = useForm<{ votes: PollValue }>({
    defaultValues: {
      votes: {},
    },
  });
  const queryClient = trpc.useContext();

  const addParticipant = trpc.useMutation(["polls.participants.add"], {
    onSuccess: (participant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: participant.pollId }],
        (existingParticipants = []) => {
          return [...existingParticipants, participant];
        },
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit(({ votes }) => {
        // update votes for participantId
      })}
    >
      <Controller
        name="votes"
        control={control}
        render={({ field }) => {
          return (
            <PollInput
              view={view}
              options={options}
              entries={entries}
              value={field.value}
              onChange={field.onChange}
            />
          );
        }}
      />
      <div className="flex justify-between space-x-3 border-t p-3">
        <Button onClick={onDone}>{t("cancel")}</Button>
        <Button type="primary">{t("continue")}</Button>
      </div>
    </form>
  );
};

export const ConnectedPoll: React.VoidFunctionComponent<{
  id: string;
  admin?: boolean;
  isLocked?: boolean;
  options: PollOption[];
  participants: Array<Participant & { votes: Vote[] }>;
  timezone: string | null;
}> = ({ admin, id, timezone, isLocked, options, participants }) => {
  const view = "grid";

  const [targetTimezone, setTargetTimezone] =
    React.useState(getBrowserTimeZone);
  const { dayjs } = useDayjs();
  const { user } = useUser();
  const userId = user.id;

  const pollOptions: PollViewOption[] = React.useMemo(
    () =>
      options.map((option, index) => {
        const score = participants.reduce((acc, curr) => {
          const vote = curr.votes.find((vote) => vote.optionId === option.id);
          if (vote?.type === "yes") {
            acc += 1;
          }
          return acc;
        }, 0);

        if (option.value.type === "time") {
          const { start, end } = option.value;
          let startTime = dayjs(start);
          let endTime = dayjs(end);
          if (timezone) {
            startTime = startTime.tz(timezone).tz(targetTimezone);
            endTime = endTime.tz(timezone).tz(targetTimezone);
          }
          return {
            id: option.id,
            type: "time",
            index,
            start: startTime.format("YYYY-MM-DDTHH:mm"),
            end: endTime.format("YYYY-MM-DDTHH:mm"),
            score,
          };
        }

        return {
          id: option.id,
          type: "date",
          index,
          date: option.value.date,
          score,
        };
      }),
    [dayjs, options, participants, targetTimezone, timezone],
  );

  const entries = React.useMemo(
    () =>
      participants.map(({ id, name, votes, userId: participantUserId }) => {
        const isYou = userId === participantUserId;
        const voteByOptionId: Record<string, VoteType | undefined> = {};
        votes.forEach((vote) => {
          voteByOptionId[vote.optionId] = vote.type;
        });
        return {
          id,
          name,
          votes: options.map((option) => {
            return votes.find((vote) => vote.optionId === option.id)?.type;
          }),
          voteByOptionId,
          you: isYou,
          editable: admin || isYou,
        };
      }),
    [admin, options, participants, userId],
  );

  const didAlreadyVote = React.useMemo(
    () => entries.findIndex(({ id }) => id === user.id) !== -1,
    [entries, user.id],
  );

  return (
    <div>
      <div>toolbar goes here</div>
      <div className="card-0">
        <Poll
          id={id}
          options={pollOptions}
          entries={entries}
          view={view}
          defaultMode={
            admin ? "read" : !isLocked && !didAlreadyVote ? "create" : "read"
          }
        />
      </div>
    </div>
  );
};

interface PollContextValue {
  id: string;
  view: "grid" | "list";
  options: PollViewOption[];
  entries: PollViewParticipant[];
  onNavigate?: (optionId: string) => void;
  onEditParticipant?: (participantId: string) => void;
  onDeleteParticipant?: (participantId: string) => void;
  onAddParticipant?: () => void;
  onChangeName?: (participantId: string) => void;
}

const PollContext = React.createContext<PollContextValue>({
  id: "",
  view: "grid",
  options: [],
  entries: [],
});

const usePollContext = () => {
  return React.useContext(PollContext);
};

const Poll: React.VoidFunctionComponent<{
  id: string;
  options: PollViewOption[];
  entries: PollViewParticipant[];
  view: "grid" | "list";
  defaultMode: "create" | "read";
}> = ({ id, options, entries, view, defaultMode }) => {
  const [activeParticipant, setActiveParticipant] =
    React.useState<PollViewParticipant | null>(null);

  const [isCreating, setCreating] = React.useState(defaultMode === "create");

  const findParticipantById = React.useCallback(
    (participantId: string): PollViewParticipant | null => {
      return entries.find(({ id }) => id === participantId) ?? null;
    },
    [entries],
  );

  const deleteParticipant = useDeleteParticipantModal();

  return (
    <PollContext.Provider
      value={{
        id,
        view,
        options,
        entries,
        onEditParticipant: (participantId) => {
          setActiveParticipant(findParticipantById(participantId));
        },
        onDeleteParticipant: deleteParticipant,
        onAddParticipant: () => {
          setCreating(true);
        },
        onChangeName: (participantId) => {
          // rename participant
        },
      }}
    >
      {isCreating ? (
        <NewEntryForm
          onDone={() => {
            setCreating(false);
          }}
        />
      ) : activeParticipant ? (
        <EditParticipantForm
          participant={activeParticipant}
          onDone={() => {
            setActiveParticipant(null);
          }}
        />
      ) : (
        <PollResults />
      )}
    </PollContext.Provider>
  );
};
