import { Trans, useTranslation } from "next-i18next";

import Calendar from "@/components/icons/calendar.svg";
import LocationMarker from "@/components/icons/location-marker.svg";

import { usePoll } from "./poll-context";

export const EventDetails = () => {
  const { t } = useTranslation("app");
  const data = usePoll();
  return (
    <div className="border-l-teal-400 py-2">
      <div className="flex justify-center">
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-teal-400 to-cyan-500">
          <Calendar className="h-5 text-orange-50" />
        </div>
      </div>
      <div className="mb-4 text-center">
        <h1 className="mb-0 text-xl font-semibold">{data.title}</h1>
        <div className="text-slate-700/40">
          <Trans
            t={t}
            i18nKey="createdBy"
            values={{ name: data.user?.name ?? t("guest") }}
            components={{ b: <span /> }}
          />
        </div>
      </div>
      <p className="text-slate-700/90">{data.description}</p>
      <div className="flex items-center gap-2 text-slate-700/75">
        <LocationMarker className="h-5" />
        <div>{data.location}</div>
      </div>
    </div>
  );
};
