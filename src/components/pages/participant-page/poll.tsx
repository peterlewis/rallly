import { VoteType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../button";
import { EventDetails } from "./event-details";
import { usePoll } from "./poll-context";
import { PollOption } from "./poll-option";
import { StyledList } from "./styled-list";

type Option = {
  vote?: VoteType;
  id: string;
};

export const Poll = () => {
  const { t } = useTranslation("app");
  const { options } = usePoll();
  const [defaultValue] = React.useState<Option[]>(
    () =>
      options.map((o) => {
        return {
          id: o.id,
          // value: votes?.[o.id],
        };
      }) ?? [],
  );
  const { control, handleSubmit } = useForm<{
    value: { id: string; vote?: VoteType }[];
  }>({
    defaultValues: {
      value: defaultValue,
    },
  });
  return (
    <div className="space-y-4">
      <EventDetails />
      <div>Please pick as many as you can:</div>
      <form
        onSubmit={handleSubmit((data) => {
          // handle submit
        })}
      >
        <StyledList
          className="-mx-4"
          options={options}
          itemRender={({ item, index }) => {
            return (
              <Controller
                control={control}
                name={`value.${index}`}
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
        <div className="-mx-4 -mb-4 flex border-t p-3">
          <Button htmlType="submit" size="lg" className="w-full" type="primary">
            {t("continue")}
          </Button>
        </div>
      </form>
    </div>
  );
};
