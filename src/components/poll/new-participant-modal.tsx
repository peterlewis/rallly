import { Disclosure } from "@headlessui/react";
import { VoteType } from "@prisma/client";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";
import { useMount } from "react-use";

import Check from "@/components/icons/check.svg";

import { useFormValidation } from "../../utils/form-validation";
import { Button } from "../button";
import { TextInput } from "../text-input";
import { PollViewOption } from "./types";
import VoteIcon from "./vote-icon";

const VoteGroup: React.VoidFunctionComponent<{
  vote: VoteType;
  options: PollViewOption[];
}> = ({ vote, options }) => {
  const { t } = useTranslation("app");
  if (options.length === 0) {
    return null;
  }
  return (
    <div className="flex w-full items-end gap-2 py-1">
      <span className="flex grow items-center gap-2 text-sm">
        <VoteIcon type={vote} />
        {t(vote)}
      </span>
      <span className="flex text-sm font-bold">{options.length}</span>
    </div>
  );
};

export const NewParticipantModal: React.VoidFunctionComponent<{
  onCancel?: () => void;
  onSubmit?: (data: {
    name: string;
    votes: Record<string, VoteType | undefined>;
  }) => Promise<void>;
  votes: Record<string, VoteType | undefined>;
  options: PollViewOption[];
}> = ({ onCancel, onSubmit, options, votes }) => {
  const { t } = useTranslation("app");

  const { requiredString } = useFormValidation();
  const { register, handleSubmit, setFocus, formState } = useForm<{
    name: string;
  }>({
    defaultValues: { name: "" },
  });

  // const groupedVotes = React.useMemo(() => {
  //   const res: Record<string, Array<{ label: string; vote: VoteType }>> = {};

  //   options.forEach((option) => {
  //     const vote = votes[option.id];
  //     if (vote && vote !== "no") {
  //       let groupName: string;
  //       let item: { label: string; vote: VoteType };
  //       if (option.type === "date") {
  //         groupName = option.value.format("MMMM YYYY");
  //         item = { label: option.value.format("dddd DD"), vote };
  //       } else {
  //         groupName = option.value.format("LL");
  //         item = { label: option.value.format("LT"), vote };
  //       }
  //       if (res[groupName]) {
  //         res[groupName].push(item);
  //       } else {
  //         res[groupName] = [item];
  //       }
  //     }
  //   });
  //   return res;
  // }, [options, votes]);

  const countByVoteType = React.useMemo(() => {
    const res: Record<VoteType, PollViewOption[]> = {
      yes: [],
      ifNeedBe: [],
      no: [],
    };
    options.forEach((option) => {
      const vote = votes[option.id];
      if (vote && vote !== "no") {
        res[vote].push(option);
      } else {
        res.no.push(option);
      }
    });
    return res;
  }, [options, votes]);

  useMount(() => {
    setFocus("name");
  });

  if (formState.isSubmitSuccessful) {
    return (
      <div className="p-6">
        <div className="mb-8 w-full space-y-4 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-400">
            <Check className="h-10 text-white" />
          </div>
          <div className="">
            <div className="mb-1 text-xl font-medium text-slate-700">
              Thank you
            </div>
            <div className="text-lg leading-snug text-slate-400">
              Your submission has been added
            </div>
          </div>
        </div>
        <Button type="primary" className="w-full" onClick={onCancel}>
          {t("continue")}
        </Button>
      </div>
    );
  }
  return (
    <div className="w-[340px] max-w-full space-y-8 p-4">
      <form
        onSubmit={handleSubmit(async ({ name }) => {
          await onSubmit?.({ name, votes });
        })}
      >
        <div className="mb-4">
          <div className="mb-2 text-xl font-semibold">New submission</div>
          <div className="text-slate-500">
            Please enter your name to submit your selection.
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-4">
            <fieldset>
              <div className="mb-1 text-sm">{t("name")}</div>
              <div>
                <TextInput
                  className="max-w-full"
                  placeholder={t("namePlaceholder")}
                  autoFocus={true}
                  {...register("name", {
                    validate: requiredString(t("name")),
                  })}
                />
              </div>
            </fieldset>
            <fieldset>
              <div className="mb-1 text-sm">
                From <strong>{options.length}</strong> options you voted:
              </div>
              <div className="py-2">
                <VoteGroup vote="yes" options={countByVoteType.yes} />
                <VoteGroup vote="ifNeedBe" options={countByVoteType.ifNeedBe} />
                <VoteGroup vote="no" options={countByVoteType.no} />
              </div>
            </fieldset>
          </div>
          <div className="flex gap-2">
            <Button className="grow" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button
              loading={formState.isSubmitting}
              htmlType="submit"
              type="primary"
              className="grow"
            >
              {t("submit")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
