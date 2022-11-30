import { VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../button";
import { usePoll } from "./poll-context";
import { PollOption } from "./poll-option";
import { StyledList } from "./styled-list";

type OptionField = { id: string; vote?: VoteType };
export type VotingFormData = { options: OptionField[] };

export const VotingForm: React.VoidFunctionComponent<{
  buttonText: string;
  defaultValues: VotingFormData;
  onSubmit?: (data: VotingFormData) => Promise<void> | void;
  onCancel?: () => void;
}> = (props) => {
  const { options } = usePoll();
  const { control, handleSubmit } = useForm<VotingFormData>({
    defaultValues: props.defaultValues,
  });
  const { t } = useTranslation("app");
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
              name={`options.${index}`}
              render={({ field }) => {
                const vote = field.value.vote;
                return (
                  <PollOption
                    optionId={item.id}
                    onChange={(v) => {
                      field.onChange({ ...field.value, vote: v });
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
        <Button type="ghost" onClick={props.onCancel}>
          {t("cancel")}
        </Button>
        <Button htmlType="submit" type="primary">
          {props.buttonText}
        </Button>
      </div>
    </form>
  );
};
