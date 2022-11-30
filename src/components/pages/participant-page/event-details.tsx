import clsx from "clsx";
import { Trans, useTranslation } from "next-i18next";

import Calendar from "@/components/icons/calendar.svg";
import LocationMarker from "@/components/icons/location-marker.svg";
import Logo from "~/public/logo.svg";

import { Button } from "../../button";
import { ParticipantPageHeader } from "./header";
import { useMeetingTabRouter } from "./meeting-tab";
import { usePoll } from "./poll-context";

export const EventDetails = (props: { className?: string }) => {
  const { t } = useTranslation("app");
  const data = usePoll();
  const [, setRouter] = useMeetingTabRouter();
  return (
    <div className={clsx(props.className)}>
      <div className="space-y-8 p-6">
        <div>
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
          <div className="mb-4 flex items-center gap-2 text-slate-700/75">
            <LocationMarker className="h-5" />
            <div>{data.location}</div>
          </div>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold">Status</div>
          <p className="text-slate-500">
            This poll is open. Click join to select your preferred times.
          </p>
          <div className="flex justify-center">
            <Button
              type="success"
              className="w-full"
              onClick={() => {
                setRouter({
                  path: "/new",
                });
              }}
            >
              Join &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
