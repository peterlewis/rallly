import { VoteType } from "@prisma/client";
import { Trans, useTranslation } from "next-i18next";
import React from "react";

import { DayjsProvider } from "../../utils/dayjs";
import { trpcNext } from "../../utils/trpc";
import { Button } from "../button";
import FullPageLoader from "../full-page-loader";
import { useModalContext } from "../modal/modal-provider";
import { NewParticipantModal } from "../poll/new-participant-modal";
import { PollValue } from "../poll/types";
import { OptionMultiSelect } from "./participant-page/option-multi-select";

export const ParticipantPage: React.VoidFunctionComponent<{
  participantLinkId: string;
}> = ({ participantLinkId }) => {
  const { data } = trpcNext.poll.getByParticipantLinkId.useQuery({
    id: participantLinkId,
  });

  const { t } = useTranslation("app");

  const [value, setValue] = React.useState(
    () =>
      data?.options.map((o, index) => {
        return { ...o, index };
      }) ?? [],
  );

  if (!data) {
    return <FullPageLoader>{t("loading")}</FullPageLoader>;
  }

  return (
    <DayjsProvider>
      <div className="line-pattern h-full overflow-auto p-6">
        <div className="mx-auto flex max-h-[calc(100vh-60px)] w-full max-w-2xl flex-col overflow-hidden rounded border bg-white shadow-md">
          <div className="p-4">
            <div className="mb-3">
              <h1 className="mb-0 text-2xl font-bold">{data.title}</h1>
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
            <div>
              Location: <strong>{data.location}</strong>
            </div>
            {data.timeZone ? (
              <div>
                Timezone: <strong>{data.timeZone}</strong>
              </div>
            ) : null}
          </div>
          <div className="flex min-h-0 flex-col divide-y">
            <OptionMultiSelect
              className="relative min-h-0 overflow-auto border-t bg-gray-100"
              options={value}
              onChange={setValue}
            />
            <div className="flex justify-end bg-gray-50 p-2">
              <Button type="primary">Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </DayjsProvider>
  );
};
