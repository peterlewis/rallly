import { VoteType } from "@prisma/client";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { usePollData } from "../poll-data-provider";
import { ParticipantForm, PollOption } from "../types";
import DateOption from "./date-option";
import TimeSlotOption from "./time-slot-option";

export interface PollOptions {
  options: Array<PollOption>;
  editable?: boolean;
  selectedParticipantId?: string;
}

const PollOptions: React.VoidFunctionComponent<PollOptions> = ({
  options,
  editable,
  selectedParticipantId,
}) => {
  const { control } = useFormContext<ParticipantForm>();

  const { getParticipantInfoById, getParticipantsWhoVoted } = usePollData();
  const { getParticipantVoteForOptionAtIndex } = usePollData();
  const selectedParticipant = selectedParticipantId
    ? getParticipantInfoById(selectedParticipantId)
    : undefined;

  return (
    <div className="divide-y">
      {options.map((option) => {
        return (
          <Controller
            key={option.index}
            control={control}
            name="votes"
            render={({ field }) => {
              const vote =
                !editable && selectedParticipant
                  ? getParticipantVoteForOptionAtIndex(
                      selectedParticipant.id,
                      option.index,
                    )
                  : field.value[option.index];

              const handleChange = (newVote: VoteType) => {
                if (!editable) {
                  return;
                }
                const newValue = [...field.value];
                newValue[option.index] = newVote;
                field.onChange(newValue);
              };

              switch (option.type) {
                case "time":
                  return (
                    <TimeSlotOption
                      onChange={handleChange}
                      optionIndex={option.index}
                      yesScore={option.score}
                      participants={getParticipantsWhoVoted(
                        "yes",
                        option.index,
                      )}
                      vote={vote}
                      startTime={option.start}
                      endTime={option.end}
                      editable={editable}
                      selectedParticipantId={selectedParticipant?.id}
                    />
                  );
                case "date":
                  return (
                    <DateOption
                      onChange={handleChange}
                      optionIndex={option.index}
                      yesScore={option.score}
                      participants={getParticipantsWhoVoted(
                        "yes",
                        option.index,
                      )}
                      vote={vote}
                      date={option.date}
                      editable={editable}
                      selectedParticipantId={selectedParticipant?.id}
                    />
                  );
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default PollOptions;
