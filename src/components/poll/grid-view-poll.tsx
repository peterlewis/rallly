import { AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useMeasure } from "react-use";

import { Button } from "../button";
import { ScrollSync, ScrollSyncPane } from "../scroll-sync";
import ParticipantRow from "./grid-view-poll/participant-row";
import { PollContext } from "./grid-view-poll/poll-context";
import PollHeader from "./grid-view-poll/poll-header";
import { PollProps, PollViewOption, PollViewParticipant } from "./types";

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
    activeParticipant,
    onChangeActiveParticipant,
  }) => {
    const { t } = useTranslation("app");

    const availableSpace = width - minSidebarWidth;

    const columnWidth = Math.min(
      Math.max(90, availableSpace / options.length),
      100,
    );

    const numberOfVisibleColumns = Math.min(
      options.length,
      Math.floor((width - minSidebarWidth) / columnWidth),
    );

    const sidebarWidth = Math.min(
      300,
      width - numberOfVisibleColumns * columnWidth,
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

    const [hideResults, setHideResults] = React.useState(false);

    const isEditing = true;

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
          isEditing,
          activeParticipantId: activeParticipant?.id ?? null,
        }}
      >
        <ScrollSync>
          <div
            style={{
              width,
            }}
          >
            <PollHeader
              participantCount={participants.length}
              options={options}
              onCancel={() => {
                onChangeActiveParticipant(null);
              }}
            />
            <AnimatePresence initial={false}>
              {!hideResults && participants.length > 0 ? (
                <div className="mt-2 border-y bg-slate-400/5 py-2">
                  <ScrollSyncPane
                    className="no-scrollbar overflow-x-auto overflow-y-hidden"
                    style={{ marginLeft: sidebarWidth }}
                  >
                    {participants.map((participant, i) => {
                      return (
                        <ParticipantRow
                          key={i}
                          options={options}
                          active={activeParticipant?.id === participant.id}
                          name={participant.name}
                          votes={participant.votes}
                          editMode={activeParticipant?.id === participant.id}
                          onChangeEditMode={(isEditing) => {
                            onChangeActiveParticipant(
                              isEditing ? participant.id : null,
                            );
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
                  </ScrollSyncPane>
                </div>
              ) : null}
            </AnimatePresence>
          </div>
        </ScrollSync>
        <div className="flex h-14 items-center justify-end space-x-3 px-2">
          <Button type="primary">{t("continue")}</Button>
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
