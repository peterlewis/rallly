import clsx from "clsx";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { encodeDateOption, getBrowserTimeZone } from "../utils/date-time-utils";
import { useFormValidation } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { NewLayout } from "./app-layout";
import { Button } from "./button";
import { DateOrTimeSelector } from "./date-or-time-selector";
import { DurationPicker } from "./forms/poll-options-form/month-calendar/duration-picker";
import { TimezonePicker } from "./forms/poll-options-form/time-zone-policy";
import { DateTimeOption } from "./forms/poll-options-form/types";

const NewProceeding: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");
  const router = useRouter();

  const { handleSubmit, register, watch, control, formState } = useForm<{
    title: string;
    location: string;
    description: string;
    options: string[];
    duration: number;
    timeZone: "auto" | "fixed";
  }>({
    defaultValues: {
      timeZone: "auto",
      duration: 0,
      options: [],
    },
  });
  const createPoll = trpc.useMutation(["polls.create"], {
    onSuccess: (res) => {
      router.replace(`/poll/${res.urlId}`);
    },
  });

  const watchDuration = watch("duration");

  const { errors } = formState;

  const [isAllDayEvent, setIsAllDayEvent] = React.useState(true);

  const { requiredString } = useFormValidation();

  return (
    <NewLayout>
      <form
        onSubmit={handleSubmit(async (data) => {
          await createPoll.mutateAsync({
            ...data,
            options: data.options.map(encodeDateOption),
            timeZone: data.timeZone === "auto" ? getBrowserTimeZone() : "",
          });
        })}
      >
        <div className="space-y-4 pb-8">
          <div>
            <div className="text-2xl font-semibold">New meeting poll</div>
            <div>Fill in the form below to create a new meeting poll</div>
          </div>
          <div>
            <div className="formField">
              <label htmlFor="title">{t("title")}</label>
              <input
                type="text"
                id="title"
                className={clsx("input w-full", {
                  "input-error": errors.title,
                })}
                placeholder={t("titlePlaceholder")}
                {...register("title", { validate: requiredString(t("title")) })}
              />
            </div>
            <div className="formField">
              <label htmlFor="location">{t("location")}</label>
              <input
                type="text"
                id="location"
                className="input w-full"
                placeholder={t("locationPlaceholder")}
                {...register("location")}
              />
            </div>
            <div className="formField">
              <label htmlFor="description">{t("description")}</label>
              <textarea
                id="description"
                className="input w-full"
                placeholder={t("descriptionPlaceholder")}
                rows={5}
                {...register("description")}
              />
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold">Options</div>
            <div className="mb-4">
              These will be the options your participants can vote for.
            </div>
            <div className="action-group mb-4">
              Duration:
              <Controller
                control={control}
                name="duration"
                render={({ field }) => {
                  return (
                    <DurationPicker
                      duration={field.value}
                      onChange={field.onChange}
                    />
                  );
                }}
              />
            </div>
            <Controller
              name="options"
              control={control}
              render={({ field }) => {
                return (
                  <DateOrTimeSelector
                    value={field.value}
                    onChange={(options) => {
                      field.onChange(options);
                    }}
                    duration={watchDuration}
                  />
                );
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold">Time zone policy</div>
            <div className="mb-4">
              Choose how participants see the times you have selected
            </div>
            <Controller
              control={control}
              name="timeZone"
              render={({ field }) => {
                return (
                  <TimezonePicker
                    value={field.value}
                    className="w-full sm:w-auto"
                    onChange={field.onChange}
                  />
                );
              }}
            />
          </div>
          <div className="mt-6 flex items-center">
            <Button
              type="primary"
              loading={createPoll.isLoading || createPoll.isSuccess}
              htmlType="submit"
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      </form>
    </NewLayout>
  );
};

export default NewProceeding;
