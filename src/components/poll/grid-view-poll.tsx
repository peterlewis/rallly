import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useMeasure } from "react-use";
import { ScrollSync, ScrollSyncNode } from "scroll-sync-react";
import smoothscroll from "smoothscroll-polyfill";

import { Button } from "../button";
import { usePoll } from "../poll-provider";
import ControlledScrollArea from "./grid-view-poll/controlled-scroll-area";
import ParticipantRow from "./grid-view-poll/participant-row";
import { PollContext } from "./grid-view-poll/poll-context";
import PollHeader from "./grid-view-poll/poll-header";
import { ParticipantForm, PollProps } from "./types";

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

    const sidebarWidth =
      Math.min(300, width - numberOfVisibleColumns * columnWidth) - 4;

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
                <ScrollSyncNode>
                  <motion.div
                    transition={{ ease: "easeOut", duration: 0.2 }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="no-scrollbar overflow-x-auto overflow-y-hidden pb-2"
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
                  </motion.div>
                </ScrollSyncNode>
              ) : null}
            </AnimatePresence>
          </div>
        </ScrollSync>
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
