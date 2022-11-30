import { VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import Check from "@/components/icons/check.svg";

import { useDayjs } from "../../../utils/dayjs";
import { trpcNext } from "../../../utils/trpc";
import { Button } from "../../button";
import { useUser } from "../../user-provider";
import { EventDetails } from "./event-details";
import { NewResponseForm } from "./new-response-form";
import { usePoll } from "./poll-context";
import { PollOption } from "./poll-option";
import { useParticipantPageRouter } from "./router";
import { StyledList } from "./styled-list";
import { VotingForm } from "./voting-form";

type Option = {
  vote?: VoteType;
  optionId: string;
};

const useUserParticipants = () => {
  const { user } = useUser();
  const { participants } = usePoll();

  return participants.filter((participant) => participant.userId === user.id);
};

export const Poll = () => {
  const { t } = useTranslation("app");
  const { options } = usePoll();
  const [state, dispatch] = useParticipantPageRouter();

  const { control, handleSubmit } = useForm<{
    value: Option[];
  }>({
    defaultValues: {
      value: state.votes,
    },
  });

  const userParticipants = useUserParticipants();
  const queryClient = trpcNext.useContext();
  const deleteParticipant = trpcNext.participant.delete.useMutation({
    onSuccess() {
      queryClient.invalidate();
    },
  });
  const { dayjs } = useDayjs();
  return (
    <div className="space-y-4">
      <EventDetails />
      {userParticipants.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded border border-green-400 bg-green-50 py-2 px-3 text-green-500">
            <Check className="mr-2 inline-block h-5" />
            You have already responded
          </div>

          <div className="space-y-4">
            {userParticipants.map((participant) => {
              return (
                <div
                  key={participant.id}
                  className="space-y-4 rounded-md border p-3"
                >
                  <div>
                    <div>{participant.name}</div>
                    <div>{dayjs(participant.createdAt).fromNow()}</div>
                  </div>
                  <div className="action-group">
                    <Button>Edit</Button>
                    <Button
                      loading={
                        deleteParticipant.variables?.id === participant.id &&
                        deleteParticipant.isLoading
                      }
                      onClick={async () => {
                        await deleteParticipant.mutateAsync({
                          id: participant.id,
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <NewResponseForm />
      )}
    </div>
  );
};
