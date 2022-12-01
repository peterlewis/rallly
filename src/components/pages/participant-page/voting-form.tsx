import { VoteType } from "@prisma/client";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../button";
import { useOptions, usePoll } from "./poll-context";
import { PollOption } from "./poll-option";
import { StyledList } from "./styled-list";

export type VotingFormData = { votes: Array<VoteType | undefined> };

export const VotingForm: React.VoidFunctionComponent<{
  buttonText: string;
  defaultValues: VotingFormData;
  onSubmit?: (data: VotingFormData) => Promise<void> | void;
  onCancel?: () => void;
}> = (props) => {
  const options = useOptions();
  const { control, handleSubmit } = useForm<VotingFormData>({
    defaultValues: props.defaultValues,
  });
  return (
    <form
      className="flex h-full flex-col divide-y"
      onSubmit={handleSubmit(async (data) => {
        await props.onSubmit?.(data);
      })}
    >
      <StyledList
        className="min-h-0 grow overflow-auto"
        options={options}
        itemRender={({ item, index }) => {
          return (
            <Controller
              control={control}
              name={`votes.${index}`}
              render={({ field }) => {
                const vote = field.value;
                return (
                  <PollOption
                    optionId={item.id}
                    onChange={(v) => {
                      field.onChange(v);
                    }}
                    vote={vote}
                  />
                );
              }}
            />
          );
        }}
      />
      <div className="flex shrink-0 justify-between p-3">
        <Button htmlType="submit" className="w-full" type="primary">
          {props.buttonText}
        </Button>
      </div>
    </form>
  );
};
