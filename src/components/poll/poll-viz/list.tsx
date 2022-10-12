import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { Dayjs } from "dayjs";
import { useTranslation } from "next-i18next";
import React from "react";

import Clock from "@/components/icons/clock.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import Plus from "@/components/icons/plus-sm.svg";

import { Button } from "../../button";
import Dropdown, { DropdownItem } from "../../dropdown";
import { Sticky } from "../../sticky";
import { usePollStateContext } from "../poll-viz";
import { ScoreSummary } from "../score-summary";
import { PollValue, PollViewOption, PollViewParticipant } from "../types";
import UserAvatar from "../user-avatar";
import VoteIcon from "../vote-icon";
import { useVoteState, VoteSelector } from "../vote-selector";

const ParticipantSummaryItem: React.VoidFunctionComponent<{
  name: string;
  vote: VoteType;
}> = ({ name, vote }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-5">
        <UserAvatar name={name} />
        <div className="absolute -right-2 top-0 z-10 h-3 w-3 rounded-full bg-white">
          <VoteIcon type={vote} size="sm" />
        </div>
      </div>
      <div className="text-slate-500">{name}</div>
    </div>
  );
};
const ParticipantSummary: React.VoidFunctionComponent<{ optionId: string }> = ({
  optionId,
}) => {
  const { participants } = usePollStateContext();
  const group = participants.reduce<
    Record<VoteType | "pending", PollViewParticipant[]>
  >(
    (acc, curr) => {
      const vote = curr.voteByOptionId[optionId];
      if (vote) {
        acc[vote].push(curr);
      } else {
        acc.pending.push(curr);
      }
      return acc;
    },
    { yes: [], no: [], ifNeedBe: [], pending: [] },
  );

  if (group.pending.length === participants.length) {
    return null;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 py-3">
      <div className="col-span-1 space-y-2">
        {group.yes.map(({ id, name }) => (
          <ParticipantSummaryItem key={id} name={name} vote="yes" />
        ))}
      </div>
      <div className="col-span-1 space-y-2">
        {group.ifNeedBe.map(({ id, name }) => (
          <ParticipantSummaryItem key={id} name={name} vote="ifNeedBe" />
        ))}
        {group.no.map(({ id, name }) => (
          <ParticipantSummaryItem key={id} name={name} vote="no" />
        ))}
      </div>
    </div>
  );
};

const DateOption: React.VoidFunctionComponent<{ date: Dayjs }> = ({ date }) => {
  return (
    <div>
      <span className="text-2xl font-bold">{date.format("DD ")}</span>
      <span className="text-xl font-medium text-slate-500/75">
        {date.format("ddd")}
      </span>
    </div>
  );
};

const TimeOption: React.VoidFunctionComponent<{ start: Dayjs; end: Dayjs }> = ({
  start,
  end,
}) => {
  return (
    <div className="flex items-center gap-2 font-semibold leading-none sm:text-lg">
      <div>
        <Clock className="h-6 text-gray-300" />
      </div>
      <div>{`${start.format("LT")} - ${end.format("LT")}`}</div>
    </div>
  );
};

const ParticipantSelector = () => {
  const { state, participants, selectParticipant } = usePollStateContext();

  const { t } = useTranslation("app");

  const selectedParticipantId =
    "participantId" in state ? state.participantId : "";

  return (
    <select
      value={selectedParticipantId}
      className="input h-9 w-full pl-3 pr-8 font-medium"
      onChange={(e) => {
        selectParticipant(e.target.value ? e.target.value : null);
      }}
    >
      <option value="">
        {t("participantCount", { count: participants.length })}
      </option>
      {participants.map((participant) => {
        return (
          <option key={participant.id} value={participant.id}>
            {participant.name}
          </option>
        );
      })}
    </select>
  );
};

interface OptionListProps {
  value?: PollValue;
  onChange?: (value: PollValue) => void;
}

const OptionList: React.VoidFunctionComponent<OptionListProps> = ({
  onChange,
  value,
}) => {
  const { options } = usePollStateContext();
  const groups = React.useMemo(
    () =>
      options.reduce<Record<string, PollViewOption[]>>((acc, curr) => {
        const group =
          curr.type === "date"
            ? curr.date.format("MMMM YYYY")
            : curr.start.format("LL");

        if (acc[group]) {
          acc[group].push(curr);
        } else {
          acc[group] = [curr];
        }
        return acc;
      }, {}),
    [options],
  );

  const { toggle } = useVoteState();

  return (
    <div className="divide-y">
      {Object.entries(groups).map(([group, options]) => {
        const day =
          options[0].type === "date" ? options[0].date : options[0].start;
        return (
          <div key={group}>
            <Sticky
              top={100}
              className={(isPinned) =>
                clsx("z-20 border-b bg-gray-100/80 py-2 px-4 font-semibold", {
                  "backdrop-blur-md": isPinned,
                })
              }
            >
              {options[0].type === "date" ? (
                group
              ) : (
                <div className="flex justify-between space-x-2">
                  <div className="">{day.format("LL")}</div>
                </div>
              )}
            </Sticky>
            <div className="divide-y bg-gray-100/75">
              {options.map((option) => {
                const vote = value?.[option.id];
                return (
                  <div
                    key={option.id}
                    className={clsx("flex gap-4 bg-white p-4", {
                      "select-none border-l-4 active:bg-slate-500/5": onChange,
                      "border-l-transparent": !vote,
                      "border-l-green-400  ": vote === "yes",
                      "border-l-amber-300  ": vote === "ifNeedBe",
                      "border-l-slate-300 ": vote === "no",
                    })}
                    role={onChange ? "button" : undefined}
                    onClick={
                      onChange
                        ? () => {
                            const newValue = { ...value };
                            newValue[option.id] = toggle(vote);
                            onChange(newValue);
                          }
                        : undefined
                    }
                  >
                    {onChange ? (
                      <div className="flex h-6 items-center">
                        <VoteSelector value={vote} />
                      </div>
                    ) : null}
                    <div className="grow space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="grow">
                          {option.type === "date" ? (
                            <DateOption date={option.date} />
                          ) : (
                            <TimeOption start={option.start} end={option.end} />
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <ScoreSummary yesScore={option.score} />
                        </div>
                      </div>
                      {/* <ParticipantSummary optionId={option.id} /> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
const VoteSummary: React.VoidFunctionComponent<{
  options: PollViewOption[];
  value: PollValue;
}> = ({ options, value }) => {
  return <div></div>;
};

const Footer = () => {
  const { state, setState, options, updateParticipant, createParticipant } =
    usePollStateContext();
  const { t } = useTranslation("app");

  switch (state.type) {
    case "read":
    case "select":
      return null;
    case "create":
      return (
        <div className="flex justify-between bg-gray-100">
          <VoteSummary options={options} value={state.votes} />
          <div className="flex justify-end gap-2  p-2 sm:rounded-b-md">
            <Button
              onClick={() => {
                setState({ type: "read" });
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                createParticipant(state.votes);
              }}
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      );
    case "edit":
      return (
        <div className="flex justify-end gap-2 rounded-b-md bg-gray-100/20 p-2">
          <Button
            onClick={() => {
              setState({ type: "select", participantId: state.participantId });
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              updateParticipant(state.participantId, state.votes);
            }}
          >
            {t("save")}
          </Button>
        </div>
      );
  }
};

export const Header = () => {
  const {
    state,
    setState,
    getParticipant,
    editParticipant,
    renameParticipant,
    deleteParticipant,
  } = usePollStateContext();
  const { t } = useTranslation("app");

  switch (state.type) {
    case "read":
      return (
        <div className="flex gap-2">
          <div className="grow">
            <ParticipantSelector />
          </div>
          <Button
            icon={<Plus />}
            type="primary"
            onClick={() => {
              setState({ type: "create", votes: {} });
            }}
          />
        </div>
      );

    case "select":
      return (
        <div className="flex gap-2">
          <div className="grow">
            <ParticipantSelector />
          </div>
          <Dropdown
            placement="bottom-end"
            trigger={<Button icon={<DotsHorizontal />} />}
          >
            <DropdownItem
              label={t("editVotes")}
              onClick={() => {
                editParticipant(state.participantId);
              }}
            />
            <DropdownItem
              label={t("changeName")}
              onClick={() => {
                renameParticipant(state.participantId);
              }}
            />
            <DropdownItem
              label={t("delete")}
              onClick={() => {
                deleteParticipant(state.participantId);
              }}
            />
          </Dropdown>
        </div>
      );
    case "create":
      return (
        <div className="flex h-full items-center gap-3 px-2">
          <div className="grow font-medium">{t("pleaseChoose")}</div>
          <UserAvatar name={t("you")} showName />
        </div>
      );
    case "edit":
      const participant = getParticipant(state.participantId);
      return (
        <div className="flex h-full items-center gap-2 px-2">
          <div className="grow">{t("pleaseChoose")}</div>
          <div>
            <UserAvatar name={participant.name} showName={true} />
          </div>
        </div>
      );
  }
};

export const PollVizList = () => {
  const { state, setState, getParticipant } = usePollStateContext();

  const getProps = React.useCallback((): OptionListProps => {
    switch (state.type) {
      case "read":
        return {};
      case "create":
        return {
          value: state.votes,
          onChange: (votes) => {
            setState({ ...state, votes });
          },
        };
      case "edit":
        return {
          value: state.votes,
          onChange: (votes) => {
            setState({ ...state, votes });
          },
        };
      case "select":
        const participant = getParticipant(state.participantId);
        return {
          value: participant.voteByOptionId,
        };
    }
  }, [getParticipant, setState, state]);
  return (
    <div className="smshadow-sm divide-y border-y bg-white sm:rounded-md sm:border">
      <Sticky
        top={47}
        className={(isPinned) =>
          clsx("z-30 bg-gray-100/80 p-2", {
            "sm:rounded-t-md": !isPinned,
            "border-b backdrop-blur-md": isPinned,
          })
        }
      >
        <div className="h-9">
          <Header />
        </div>
      </Sticky>
      <OptionList {...getProps()} />
      <Footer />
    </div>
  );
};
