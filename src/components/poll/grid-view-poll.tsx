import { useTranslation } from "next-i18next";
import * as React from "react";
import { useMeasure } from "react-use";
import smoothscroll from "smoothscroll-polyfill";

import Check from "@/components/icons/check.svg";
import Plus from "@/components/icons/plus-sm.svg";

import { Button } from "../button";
import ArrowLeft from "../icons/arrow-left.svg";
import ArrowRight from "../icons/arrow-right.svg";
import { usePoll } from "../poll-provider";
import { SegmentedButton, SegmentedButtonGroup } from "../segmented-button";
import ParticipantRow from "./grid-view-poll/participant-row";
import ParticipantRowForm from "./grid-view-poll/participant-row-form";
import { PollContext } from "./grid-view-poll/poll-context";
import PollHeader from "./grid-view-poll/poll-header";
import { PollProps } from "./types";

// TODO (Luke Vella) [2022-07-15]: Not sure if the smoothscroll polyfill is still needed.
if (typeof window !== "undefined") {
  smoothscroll.polyfill();
}

const minSidebarWidth = 220;

const GridViewPoll: React.VoidFunctionComponent<PollProps & { width: number }> =
  ({
    options,
    participants,
    onEntry,
    onDeleteEntry,
    onUpdateEntry,
    isBusy,
    userAlreadyVoted,
    width,
  }) => {
    const { t } = useTranslation("app");

    const { poll } = usePoll();

    const [editingParticipantId, setEditingParticipantId] =
      React.useState<string | null>(null);

    const availableSpace = width - minSidebarWidth;

    const columnWidth = Math.min(
      Math.max(100, availableSpace / options.length),
      120,
    );

    const numberOfVisibleColumns = Math.min(
      options.length,
      Math.floor((width - minSidebarWidth) / columnWidth),
    );

    const sidebarWidth =
      Math.min(300, width - numberOfVisibleColumns * columnWidth) - 40;

    const [activeOptionId, setActiveOptionId] =
      React.useState<string | null>(null);

    const [scrollPosition, setScrollPosition] = React.useState(0);

    const maxScrollPosition =
      columnWidth * options.length - columnWidth * numberOfVisibleColumns;

    const [shouldShowNewParticipantForm, setShouldShowNewParticipantForm] =
      React.useState(!userAlreadyVoted);

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

    const participantListContainerRef = React.useRef<HTMLDivElement>(null);

    const renderPageControl = () => {
      return (
        <div className="flex items-center">
          <div className="px-3 text-sm font-medium text-slate-500">
            {t("optionCount", { count: options.length })}
          </div>
          {numberOfVisibleColumns < options.length ? (
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
        }}
      >
        <div
          className="relative mx-auto flex flex-col border-y bg-white"
          style={{
            width,
          }}
        >
          <div className="flex h-14 items-center justify-end space-x-3 border-b bg-slate-500/5 px-3">
            {renderPageControl()}
          </div>
          <div className="sticky top-12 z-20 flex rounded-t-lg bg-white/75 py-2 backdrop-blur-md">
            <div
              className="flex shrink-0 items-center py-2 pl-5 pr-2 font-medium"
              style={{ width: sidebarWidth }}
            >
              <div className="flex h-full grow items-end">
                {t("participantCount", { count: participants.length })}
              </div>
            </div>
            <PollHeader options={options} />
          </div>
          {participants.length > 0 ? (
            <div
              className="min-h-0 overflow-y-auto"
              ref={participantListContainerRef}
            >
              {participants.map((participant, i) => {
                return (
                  <ParticipantRow
                    key={i}
                    options={options}
                    name={participant.name}
                    votes={participant.votes}
                    editMode={editingParticipantId === participant.id}
                    onChangeEditMode={(isEditing) => {
                      setEditingParticipantId(
                        isEditing ? participant.id : null,
                      );
                      if (isEditing) {
                        setShouldShowNewParticipantForm(false);
                      }
                    }}
                    isYou={participant.you}
                    isEditable={participant.editable}
                    onChange={async (update) => {
                      await onUpdateEntry?.(participant.id, update);
                    }}
                    onDelete={async () => {
                      await onDeleteEntry?.(participant.id);
                    }}
                  />
                );
              })}
            </div>
          ) : null}
          {onEntry && shouldShowNewParticipantForm ? (
            <ParticipantRowForm
              options={options}
              onSubmit={async (data) => {
                await onEntry(data);
                setShouldShowNewParticipantForm(false);
              }}
            />
          ) : null}
          {!poll.closed ? (
            <div className="mt-2 flex h-14 shrink-0 items-center rounded-b-lg border-t bg-slate-500/5 px-3">
              <div className="flex grow justify-between space-x-4">
                {shouldShowNewParticipantForm || editingParticipantId ? (
                  <div className="flex items-center space-x-3">
                    <Button
                      key="submit"
                      form="participant-row-form"
                      htmlType="submit"
                      type="primary"
                      icon={<Check />}
                      loading={isBusy}
                    >
                      {t("save")}
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingParticipantId) {
                          setEditingParticipantId(null);
                        } else {
                          setShouldShowNewParticipantForm(false);
                        }
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      key="add-participant"
                      onClick={() => {
                        setShouldShowNewParticipantForm(true);
                      }}
                      icon={<Plus />}
                    >
                      {t("addParticipant")}
                    </Button>
                    {userAlreadyVoted ? (
                      <div className="flex items-center text-sm text-gray-400">
                        <Check className="mr-1 h-5" />
                        <div>{t("alreadyVoted")}</div>
                      </div>
                    ) : null}
                  </div>
                )}
                {renderPageControl()}
              </div>
            </div>
          ) : null}
        </div>
      </PollContext.Provider>
    );
  };

const Resizer: React.VoidFunctionComponent<PollProps> = (props) => {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  return (
    <div ref={ref}>
      {width > 0 ? <GridViewPoll {...props} width={width} /> : null}
    </div>
  );
};

export default Resizer;
