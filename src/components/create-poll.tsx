import clsx from "clsx";
import dayjs from "dayjs";
import produce from "immer";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { encodeDateOption, getBrowserTimeZone } from "../utils/date-time-utils";
import { useFormValidation } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { NewLayout } from "./app-layout";
import { Button } from "./button";
import { DateOrTimeSelector } from "./date-or-time-selector";
import { DurationPicker } from "./forms/poll-options-form/month-calendar/duration-picker";
import { TimezonePicker } from "./forms/poll-options-form/time-zone-policy";
import { DateTimeOption } from "./forms/poll-options-form/types";
import { NewPollFormData } from "./types";

const NewProceeding: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");
  const router = useRouter();

  const form = useForm<NewPollFormData>({
    defaultValues: {
      timezonePolicy: "auto",
      duration: 0,
      dates: [],
      shouldUseSameTimeForAllDates: true,
    },
  });

  const { handleSubmit, register, control, formState } = form;
  const createPoll = trpc.useMutation(["polls.create"], {
    onSuccess: (res) => {
      router.replace(`/poll/${res.urlId}`);
    },
  });

  const duration = form.watch("duration");

  const { errors } = formState;

  const { requiredString } = useFormValidation();

  return (
    <NewLayout>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(async (data) => {
            const options: string[] = [];
            for (const { date, times } of data.dates) {
              if (data.duration > 0) {
                if (data.shouldUseSameTimeForAllDates) {
                  for (const { time } of data.globalTimes) {
                    const start = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm");
                    const end = start.add(data.duration, "minutes");
                    options.push(
                      `${start.format("YYYY-MM-DDTHH:mm:ss")}/${end.format(
                        "YYYY-MM-DDTHH:mm:ss",
                      )}`,
                    );
                  }
                } else {
                  for (const { time } of times) {
                    const start = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm");
                    const end = start.add(data.duration, "minutes");
                    options.push(
                      `${start.format("YYYY-MM-DDTHH:mm:ss")}/${end.format(
                        "YYYY-MM-DDTHH:mm:ss",
                      )}`,
                    );
                  }
                }
              } else {
                options.push(date);
              }
            }

            await createPoll.mutateAsync({
              title: data.title,
              location: data.location,
              description: data.description,
              timeZone:
                data.timezonePolicy === "auto" ? getBrowserTimeZone() : "",
              options,
              demo: false,
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
                  {...register("title", {
                    validate: requiredString(t("title")),
                  })}
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
              <DateOrTimeSelector />
            </div>
            {duration > 0 ? (
              <div>
                <div className="text-lg font-semibold">Time Zone Policy</div>
                <div className="mb-4">
                  Choose how participants see the times you have selected
                </div>
                <Controller
                  control={control}
                  name="timezonePolicy"
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
            ) : null}
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
      </FormProvider>
    </NewLayout>
  );
};

export default NewProceeding;
