import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import { StartOfWeek, TimeFormat, useDayjs } from "../utils/dayjs";
import { LanguageSelect } from "./poll/language-selector";
import { RadioGroup } from "./radio";

const Preferences: React.VoidFunctionComponent = () => {
  const { t } = useTranslation(["app", "common"]);

  const { weekdays, weekStartsOn, setWeekStartsOn, timeFormat, setTimeFormat } =
    useDayjs();
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 space-y-2">
        <div className="grow text-sm text-slate-500">
          {t("common:language")}
        </div>
        <LanguageSelect className="w-full" onChange={() => router.reload()} />
      </div>
      <div className="grow space-y-2">
        <div>
          <div className="mb-2 grow text-sm text-slate-500">
            {t("app:weekStartsOn")}
          </div>
          <div>
            <RadioGroup<StartOfWeek>
              value={weekStartsOn}
              onChange={setWeekStartsOn}
              options={[
                {
                  label: weekdays[0],
                  value: "sunday",
                },
                {
                  label: weekdays[1],
                  value: "monday",
                },
              ]}
            />
          </div>
        </div>
        <div className="">
          <div className="mb-2 grow text-sm text-slate-500">
            {t("app:timeFormat")}
          </div>
          <RadioGroup<TimeFormat>
            value={timeFormat}
            onChange={setTimeFormat}
            options={[
              {
                label: t("app:12h"),
                value: "12h",
              },
              {
                label: t("app:24h"),
                value: "24h",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Preferences;
