import { Participant, Vote, VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";
import toast from "react-hot-toast";
import { useMeasure } from "react-use";

import ArrowLeft from "@/components/icons/arrow-left.svg";
import ArrowRight from "@/components/icons/arrow-right.svg";
import Pencil from "@/components/icons/pencil.svg";
import Plus from "@/components/icons/plus-sm.svg";
import Trash from "@/components/icons/trash.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { useDayjs } from "../../utils/dayjs";
import { trpc } from "../../utils/trpc";
import { PollOption } from "../../utils/trpc/types";
import { Button } from "../button";
import CompactButton from "../compact-button";
import { CustomScrollbar } from "../custom-scrollbar";
import ModalProvider, { useModalContext } from "../modal/modal-provider";
import { ScrollSync, ScrollSyncPane, useScrollSync } from "../scroll-sync";
import { Sticky } from "../sticky";
import { useRequiredContext } from "../use-required-context";
import { useUser } from "../user-provider";
import { ChangeNameModal } from "./change-name-modal";
import { ParticipantRowView } from "./grid-view-poll/participant-row";
import { NewParticipantModal } from "./new-participant-modal";
import { PollValue, PollViewOption, PollViewParticipant } from "./types";
import { useDeleteParticipantModal } from "./use-delete-participant-modal";
import UserAvatar from "./user-avatar";
import VoteIcon from "./vote-icon";
import { useVoteState } from "./vote-selector";

interface GridProps {
  width: number;
  sidebarWidth: number;
  hasOverflow: boolean;
  columnWidth: number;
  numberOfVisibleColumns: number;
}

export const GridContext = React.createContext<GridProps | null>(null);

export const useGridContext = () => {
  return useRequiredContext(GridContext);
};

export const useGrid = <T extends HTMLElement>(columns: number) => {
  const minSidebarWidth = 220;

  const [ref, { width }] = useMeasure<T>();
  const availableSpace = width - minSidebarWidth - 2;

  const columnWidth = Math.min(Math.max(90, availableSpace / columns), 100);

  const numberOfVisibleColumns = Math.min(
    columns,
    Math.floor((width - minSidebarWidth) / columnWidth),
  );

  const sidebarWidth = Math.min(
    300,
    width - numberOfVisibleColumns * columnWidth,
  );

  return {
    ref,
    props: {
      width,
      sidebarWidth,
      hasOverflow: numberOfVisibleColumns < columns,
      numberOfVisibleColumns,
      columnWidth,
      optimalWidth: width
        ? sidebarWidth + numberOfVisibleColumns * columnWidth
        : undefined,
    },
  };
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
      <div className="ml-4 flex h-full divide-x border-l">
        <button
          className={clsx("h-full px-2", {
            "hover:bg-slate-500/5 active:bg-slate-500/10": !didNotScroll,
            "bg-slate-500/5 text-slate-500/75": didNotScroll,
          })}
          disabled={didNotScroll}
          type="button"
          onClick={() => {
            setScroll(Math.max(0, Math.round(left / step) * step - step));
          }}
        >
          <ArrowLeft className="h-4" />
        </button>
        <button
          className={clsx("h-full px-2", {
            "hover:bg-slate-500/5 active:bg-slate-500/10": !hasReachedEnd,
            "bg-slate-500/5 text-slate-500/75": hasReachedEnd,
          })}
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

const GridPollOptionList: React.VoidFunctionComponent<{
  className?: string;
  renderOption?: React.ComponentType<{
    option: PollViewOption;
    children?: React.ReactNode;
  }>;
  options: PollViewOption[];
}> = ({ className, options, renderOption }) => {
  const { hasOverflow, numberOfVisibleColumns, columnWidth } = useGridContext();
  return (
    <div className={className}>
      <ScrollSyncPane
        className="no-scrollbar flex overflow-y-auto"
        style={{
          width: numberOfVisibleColumns * columnWidth,
        }}
      >
        {options.map((option, i) => (
          <div
            key={i}
            className="shrink-0 border-r"
            style={{ width: columnWidth }}
          >
            {renderOption ? (
              React.createElement(
                renderOption,
                { option },
                <GridPollOption option={option} />,
              )
            ) : (
              <GridPollOption option={option} />
            )}
          </div>
        ))}
      </ScrollSyncPane>
      {hasOverflow ? (
        <div className="flex h-8  items-center border-t">
          <NavigationControl
            step={columnWidth}
            maxValue={(options.length - numberOfVisibleColumns) * columnWidth}
            count={options.length}
          />
        </div>
      ) : null}
    </div>
  );
};

const GridPollHeader: React.VoidFunctionComponent<{
  sidebar: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}> = ({ sidebar, suffix, children }) => {
  const { sidebarWidth } = useGridContext();
  return (
    <Sticky
      top={47}
      className={(isPinned) =>
        clsx("group z-20 border", {
          "rounded-t-md": !isPinned,
          "bg-white shadow-[0_3px_3px_0px_rgba(0,0,0,0.02)]": isPinned,
        })
      }
    >
      {suffix ? <div className="border-b">{suffix}</div> : null}
      <div className="flex w-fit max-w-full">
        <div
          className="shrink-0 border-r p-4 pb-4"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </div>
        <div className="min-w-0 grow">{children}</div>
      </div>
    </Sticky>
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
            i18nDate: startTime.format("LLL"),
            index,
            start: startTime.format("YYYY-MM-DDTHH:mm"),
            end: endTime.format("YYYY-MM-DDTHH:mm"),
            score,
          };
        }

        return {
          id: option.id,
          type: "date",
          i18nDate: dayjs(option.value.date).format("LL"),
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
    <ModalProvider>
      <Poll id={id} options={pollOptions} entries={entries} view={view} />
    </ModalProvider>
  );
};

export type PollStateRead = { type: "read" };
export type PollStateEdit = {
  type: "edit";
  participantId: string;
  votes: PollValue;
  name: string;
};
export type PollStateSelect = {
  type: "select";
  participantId: string;
};

export type PollStateCreate = {
  type: "create";
  votes: PollValue;
};

export type PollState =
  | PollStateRead
  | PollStateEdit
  | PollStateCreate
  | PollStateSelect;

interface PollContextValue {
  options: PollViewOption[];
  entries: PollViewParticipant[];
  state: PollState;
  getParticipant: (id: string) => PollViewParticipant | null;
  onAddParticipant: (votes: PollValue) => void;
  onEditParticipant: (participantId: string, votes: PollValue) => void;
  onStateChange?: React.Dispatch<React.SetStateAction<PollState>>;
  onDeleteParticipant?: (participantId: string) => void;
  onChangeName?: (participantId: string) => void;
}

const PollContext = React.createContext<PollContextValue | null>(null);

export const usePollContext = () => {
  return useRequiredContext(PollContext);
};

const GridPollOption: React.VoidFunctionComponent<{
  className?: string;
  option: PollViewOption;
  suffix?: React.ReactNode;
}> = ({ option, className, suffix }) => {
  const { dayjs } = useDayjs();
  const date = dayjs(option.type === "date" ? option.date : option.start);
  return (
    <div className={clsx("text-center", className)}>
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

const GridPollEntries: React.VoidFunctionComponent<{
  className?: string;
  entries: PollViewParticipant[];
  selectedId?: string;
  disabled?: boolean;
  onSelect?: (participantId: string) => void;
}> = ({ entries, selectedId, onSelect, disabled, className }) => {
  return (
    <div className={className}>
      {entries.map((entry) => {
        return (
          <ParticipantRowView
            disabled={disabled}
            className=""
            key={entry.id}
            selected={selectedId === entry.id}
            name={entry.name}
            votes={entry.votes}
            onSelect={() => {
              onSelect?.(entry.id);
            }}
          />
        );
      })}
    </div>
  );
};

const GridPollOptionToggle: React.VoidFunctionComponent<{
  className?: string;
  value?: VoteType;
  option: PollViewOption;
  onChange?: (value: VoteType) => void;
}> = ({ option, className, value, onChange }) => {
  const { toggle } = useVoteState(value);
  return (
    <div
      className={clsx(
        "h-full hover:bg-slate-500/5 active:bg-slate-500/10",

        className,
      )}
      role="button"
      onClick={() => {
        onChange?.(toggle());
      }}
    >
      <GridPollOption option={option} suffix={<VoteIcon type={value} />} />
    </div>
  );
};

const GridPollFooter: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="-mt-px flex h-14 items-center justify-between space-x-4 rounded-b-md border bg-white px-2">
      {children}
    </div>
  );
};

const GridPollNew: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");

  const {
    onStateChange,
    onChangeName,
    onDeleteParticipant,
    options,
    onAddParticipant: onCreateEntry,
    onEditParticipant: onEditEntry,
    entries,
    state,
    getParticipant: getEntry,
  } = usePollContext();

  const renderHeader = () => {
    switch (state.type) {
      case "select":
      case "read":
        return (
          <GridPollHeader
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
                    onClick={() => {
                      onStateChange?.({ type: "create", votes: {} });
                    }}
                  />
                </div>
              </div>
            }
          >
            <GridPollOptionList
              options={options}
              renderOption={({ option }) => {
                return <GridPollOption option={option} />;
              }}
            />
          </GridPollHeader>
        );
      case "create":
        return (
          <GridPollHeader
            sidebar={
              <div className="h-full">
                <div>
                  <UserAvatar name={t("you")} showName={true} />
                </div>
              </div>
            }
            suffix={
              <div className="flex items-center justify-between rounded-t-md bg-white py-2 pl-4 pr-2 font-medium">
                <div>Please choose your preferred dates</div>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    onClick={() => {
                      onStateChange?.({ type: "read" });
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      onCreateEntry(state.votes ?? {});
                    }}
                  >
                    {t("continue")}
                  </Button>
                </div>
              </div>
            }
          >
            <GridPollOptionList
              options={options}
              renderOption={({ option }) => {
                return (
                  <GridPollOptionToggle
                    option={option}
                    value={state.votes?.[option.id]}
                    onChange={(value) => {
                      const newVotes = { ...state.votes };
                      newVotes[option.id] = value;
                      onStateChange?.({ ...state, votes: newVotes });
                    }}
                  />
                );
              }}
            />
          </GridPollHeader>
        );
      case "edit": {
        const participant = getEntry(state.participantId);
        return (
          <GridPollHeader
            sidebar={
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-2 font-medium">{t("editVotes")}</div>
                  <div>
                    <UserAvatar
                      name={participant?.name ?? ""}
                      showName={true}
                    />
                  </div>
                </div>
              </div>
            }
            suffix={
              <div className="h-7 border-t bg-slate-500/5 px-3 text-right text-xs leading-7 text-slate-700/50">
                Press <strong>Save</strong> when you're ready{" "}
                <span className="relative top-1 inline-block animate-bounce">
                  &darr;
                </span>
              </div>
            }
          >
            <GridPollOptionList
              options={options}
              renderOption={({ option }) => {
                return (
                  <GridPollOptionToggle
                    option={option}
                    value={state.votes?.[option.id]}
                    onChange={(value) => {
                      const newVotes = { ...state.votes };
                      newVotes[option.id] = value;
                      onStateChange?.({ ...state, votes: newVotes });
                    }}
                  />
                );
              }}
            />
          </GridPollHeader>
        );
      }
      // case "select":
      //   const participant = getEntry(state.participantId);
      //   const voteByOptionId = participant?.voteByOptionId ?? {};
      //   return (
      //     <GridPollHeader
      //       sidebar={
      //         <div>
      //           <div className="mb-2 font-medium">Manage participant</div>
      //           <div>
      //             <UserAvatar name={participant?.name ?? ""} showName={true} />
      //           </div>
      //         </div>
      //       }
      //     >
      //       <GridPollOptionList
      //         options={options}
      //         renderOption={({ option }) => {
      //           return (
      //             <GridPollOption
      //               option={option}
      //               suffix={
      //                 <GridPollOptionSuffix>
      //                   <VoteIcon type={voteByOptionId[option.id]} />
      //                 </GridPollOptionSuffix>
      //               }
      //             />
      //           );
      //         }}
      //       />
      //     </GridPollHeader>
      // );
    }
  };

  const { ref, props: gridProps } = useGrid<HTMLDivElement>(options.length);

  const renderFooter = () => {
    switch (state.type) {
      case "create":
        return (
          <GridPollFooter>
            <div>
              <Button
                onClick={() => {
                  onStateChange?.({ type: "read" });
                }}
              >
                {t("cancel")}
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  onCreateEntry(state.votes ?? {});
                }}
                type="primary"
              >
                {t("continue")}
              </Button>
            </div>
          </GridPollFooter>
        );
      case "edit":
        return (
          <GridPollFooter>
            <div>
              <Button
                onClick={() => {
                  onStateChange?.({
                    type: "select",
                    participantId: state.participantId,
                  });
                }}
              >
                {t("cancel")}
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  onEditEntry(state.participantId, state.votes);
                }}
                type="primary"
              >
                {t("save")}
              </Button>
            </div>
          </GridPollFooter>
        );
      case "select":
        return (
          <GridPollFooter>
            <div className="space-x-2">
              <Button
                type="danger"
                icon={<Trash />}
                onClick={() => {
                  onDeleteParticipant?.(state.participantId);
                }}
              >
                {t("delete")}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  onStateChange?.({ type: "read" });
                }}
              >
                {t("unselect")}
              </Button>
              <Button
                onClick={() => {
                  onChangeName?.(state.participantId);
                }}
              >
                {t("changeName")}
              </Button>
              <Button
                icon={<Pencil />}
                onClick={() => {
                  const participant = getEntry(state.participantId);
                  if (participant) {
                    onStateChange?.({
                      type: "edit",
                      participantId: participant.id,
                      name: participant.name,
                      votes: participant.voteByOptionId,
                    });
                  }
                }}
              >
                {t("editVotes")}
              </Button>
            </div>
          </GridPollFooter>
        );
      default:
        return <GridPollFooter></GridPollFooter>;
    }
  };
  return (
    <GridContext.Provider value={gridProps}>
      <ScrollSync>
        <div className="max-w-full rounded-md bg-white shadow-sm" ref={ref}>
          {renderHeader()}
          <div className="overflow-hidden rounded-b-md bg-slate-500/5">
            {entries.length > 0 ? (
              <GridPollEntries
                disabled={state.type === "create" || state.type === "edit"}
                entries={entries}
                className="border-x"
                selectedId={
                  "participantId" in state ? state.participantId : undefined
                }
                onSelect={(participantId) => {
                  if (
                    state.type === "select" &&
                    state.participantId === participantId
                  ) {
                    onStateChange?.({ type: "read" });
                  } else {
                    const participant = getEntry(participantId);
                    if (participant) {
                      onStateChange?.({
                        type: "select",
                        participantId,
                      });
                    }
                  }
                }}
              />
            ) : null}
            {/* {renderFooter()} */}
          </div>
        </div>
      </ScrollSync>
    </GridContext.Provider>
  );
};

const Poll: React.VoidFunctionComponent<{
  id: string;
  options: PollViewOption[];
  entries: PollViewParticipant[];
  view: "grid" | "list";
}> = ({ id, options, entries }) => {
  const [mode, setMode] = React.useState<PollState>({ type: "read" });

  const { t } = useTranslation("app");
  const findParticipantById = React.useCallback(
    (participantId: string): PollViewParticipant | null => {
      return entries.find(({ id }) => id === participantId) ?? null;
    },
    [entries],
  );

  const modalContext = useModalContext();

  const deleteParticipant = useDeleteParticipantModal({
    onSuccess: () => {
      setMode({ type: "read" });
    },
  });

  const queryClient = trpc.useContext();
  const addParticipant = trpc.useMutation("polls.participants.add", {
    onSuccess: (newParticipant) => {
      queryClient.setQueryData(
        ["polls.participants.list", { pollId: id }],
        (participants = []) => {
          return [...participants, newParticipant];
        },
      );
      setMode({ type: "select", participantId: newParticipant.id });
    },
  });

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
    <PollContext.Provider
      value={{
        options,
        entries,
        state: mode,
        onEditParticipant: async (participantId, votes) => {
          await updateParticipant.mutateAsync({
            pollId: id,
            participantId,
            votes: options.map(({ id }) => {
              return {
                optionId: id,
                type: votes[id] ?? "no",
              };
            }),
          });
          setMode({ type: "select", participantId });
          toast.success(t("saved"));
        },
        getParticipant: findParticipantById,
        onAddParticipant: (votes) => {
          modalContext.render({
            footer: null,
            showClose: true,
            overlayClosable: true,
            content: function Content({ close }) {
              return (
                <NewParticipantModal
                  onCancel={close}
                  votes={votes}
                  options={options}
                  onSubmit={async ({ name, votes }) => {
                    await addParticipant.mutateAsync({
                      pollId: id,
                      name,
                      votes: options.map(({ id }) => {
                        return {
                          optionId: id,
                          type: votes[id] ?? "no",
                        };
                      }),
                    });
                  }}
                />
              );
            },
          });
        },
        onStateChange: setMode,
        onDeleteParticipant: deleteParticipant,
        onChangeName: (participantId) => {
          const participant = findParticipantById(participantId);
          if (participant) {
            // rename participant
            modalContext.render({
              overlayClosable: true,
              showClose: true,
              content: function Content({ close }) {
                return (
                  <ChangeNameModal
                    participantId={participant.id}
                    pollId={id}
                    currentName={participant.name}
                    onDone={close}
                  />
                );
              },
              footer: null,
            });
          }
        },
      }}
    >
      <GridPollNew />
    </PollContext.Provider>
  );
};
