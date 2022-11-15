import { Option, Participant, Vote } from "@prisma/client";
import clsx from "clsx";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";

import Discussion from "@/components/discussion";
import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import DocumentText from "@/components/icons/document-text.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import LocationMarker from "@/components/icons/location-marker.svg";
import Pencil from "@/components/icons/pencil.svg";
import Trash from "@/components/icons/trash.svg";
import { parseTimeValue } from "@/utils/date-time-utils";

import { useDayjs } from "../utils/dayjs";
import { useFormValidation } from "../utils/form-validation";
import { trpc } from "../utils/trpc";
import { NewLayout } from "./app-layout";
import { Button } from "./button";
import CompactButton from "./compact-button";
import { DonutScore } from "./donut-score";
import Dropdown, { DropdownItem } from "./dropdown";
import { createModalHook, withModal } from "./modal/modal-provider";
import { useParticipants } from "./participants-provider";
import NotificationsToggle from "./poll/notifications-toggle";
import { PollLayout } from "./poll/poll-layout";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import UserAvatar, { UserAvatarProvider } from "./poll/user-avatar";
import { PollGridViz } from "./poll-option-list/poll-grid-viz";
import { DateOptionResult, TimeOptionResult } from "./poll-option-list/types";
import { usePoll } from "./poll-provider";
import { usePollMutations } from "./use-poll-mutations";

const PollPage: NextPage = () => {
  const { poll, urlId } = usePoll();
  const { participants } = useParticipants();
  const router = useRouter();

  useTouchBeacon(poll.id);

  const { t } = useTranslation("app");

  const plausible = usePlausible();

  const { updatePoll } = usePollMutations();

  React.useEffect(() => {
    if (router.query.unsubscribe) {
      updatePoll.mutate(
        { urlId: urlId, notifications: false },
        {
          onSuccess: () => {
            toast.success(t("notificationsDisabled"));
            plausible("Unsubscribed from notifications");
          },
        },
      );
      router.replace(`/admin/${router.query.urlId}`, undefined, {
        shallow: true,
      });
    }
  }, [plausible, urlId, router, updatePoll, t]);

  const names = React.useMemo(
    () => participants?.map(({ name }) => name) ?? [],
    [participants],
  );

  return (
    <NewLayout title={poll.title} backHref="/polls">
      <PollLayout>
        <UserAvatarProvider seed={poll.id} names={names}>
          <Head>
            <title>{poll.title}</title>
            <meta name="robots" content="noindex,nofollow" />
          </Head>
          <div className="mx-auto sm:space-y-4">
            <div className="min-w-0 grow space-y-6">
              <div className="relative">
                <Results />
                {participants.length === 0 ? (
                  <div className="absolute inset-0 z-30 mx-auto mt-16 h-fit  max-w-md rounded-md border bg-white p-6 shadow-md">
                    <div className="mb-2 font-semibold">Share link</div>
                    <div className="mb-4 text-slate-500">
                      Share this link with your participants to start collecting
                      responses.
                    </div>
                    <div className="action-group flex justify-between rounded border p-2">
                      <div className="truncate">{`${window.location.origin}/p/${poll.participantUrlId}`}</div>
                      <Button className="shrink-0">{t("copyLink")}</Button>
                    </div>
                  </div>
                ) : null}
              </div>
              <Discussion />
            </div>

            {/* <div className="space-y-4">
                <AppLayoutHeading
                  title={preventWidows(poll.title)}
                  description={<PollSubheader />}
                />
                {poll.description ? (
                  <div className="border-primary whitespace-pre-line md:text-lg">
                    <TruncatedLinkify>
                      {preventWidows(poll.description)}
                    </TruncatedLinkify>
                  </div>
                ) : null}
                {poll.location ? (
                  <div className="lg:text-lg">
                    <div className="text-sm text-slate-500">
                      {t("location")}
                    </div>
                    <TruncatedLinkify>{poll.location}</TruncatedLinkify>
                  </div>
                ) : null}
                <div className="lg:text-lg">
                  <div className="text-sm text-slate-500">
                    {t("possibleAnswers")}
                  </div>
                  <Legend />
                </div>
              </div> */}
            {/* <DescriptionSection />
            <LocationSection /> */}
            {/* <Section
              title={t("poll")}
              icon={Chart}
              actions={
                <div className="action-group">
                  <Dropdown
                    placement="bottom-end"
                    trigger={
                      <Button icon={<Pencil />}>{t("editOptions")}</Button>
                    }
                  >
                    <DropdownItem label={t("Add options")} icon={Plus} />
                    <DropdownItem label={t("Remove options")} icon={Minus} />
                  </Dropdown>
                </div>
              }
            >
              {participants ? <ConnectedPollViz /> : null}
            </Section> */}
          </div>
        </UserAvatarProvider>
      </PollLayout>
    </NewLayout>
  );
};

const getNamesByVote = (
  optionId: string,
  participants: Array<Participant & { votes: Vote[] }>,
) => {
  const yes: string[] = [];
  const ifNeedBe: string[] = [];
  const no: string[] = [];

  for (let i = 0; i < participants.length; i++) {
    for (let j = 0; j < participants[i].votes.length; j++) {
      if (participants[i].votes[j].optionId === optionId) {
        switch (participants[i].votes[j].type) {
          case "yes":
            yes.push(participants[i].name);
            break;
          case "ifNeedBe":
            ifNeedBe.push(participants[i].name);
            break;
          case "no":
            no.push(participants[i].name);
            break;
        }
      }
    }
  }

  return {
    namesByVote: { yes, ifNeedBe, no },
    yesCount: yes.length,
    ifNeedBeCount: ifNeedBe.length,
    noCount: no.length,
  };
};

const usePollOptionData = (
  options: Option[],
  participants: Array<Participant & { votes: Vote[] }>,
) => {
  return React.useMemo<
    | {
        type: "date";
        data: DateOptionResult[];
      }
    | {
        type: "time";
        data: TimeOptionResult[];
      }
  >(() => {
    const isTime = options[0].value.indexOf("/") !== -1;

    return isTime
      ? {
          type: "time",
          data: options.map((option) => ({
            type: "time",
            ...parseTimeValue(option.value),
            votes: participants.map((participant) => {
              const vote = participant.votes.find(
                ({ optionId }) => optionId === option.id,
              );
              return vote?.type;
            }),
            ...getNamesByVote(option.id, participants),
          })),
        }
      : {
          type: "date",
          data: options.map<DateOptionResult>((option) => ({
            type: "date",
            date: option.value,
            votes: participants.map((participant) => {
              const vote = participant.votes.find(
                ({ optionId }) => optionId === option.id,
              );
              return vote?.type;
            }),
            ...getNamesByVote(option.id, participants),
          })),
        };
  }, [options, participants]);
};

const Grid = () => {
  const { poll } = usePoll();
  const { participants } = useParticipants();

  const pollGridProps = usePollOptionData(poll.options, participants);

  return <PollGridViz {...pollGridProps} participants={participants} />;
};

export default withModal(PollPage);

const TopPick: React.VoidFunctionComponent<{
  option: DateOptionResult | TimeOptionResult;
}> = ({ option }) => {
  const { dayjs } = useDayjs();
  const title = dayjs(
    option.type === "date" ? option.date : option.start,
  ).format("LL");

  const yes = option.namesByVote.yes.length;
  const ifNeedBe = option.namesByVote.ifNeedBe.length;
  const no = option.namesByVote.no.length;

  return (
    <div className="flex grow items-start justify-between gap-4 rounded-md border bg-white p-6">
      <div>
        <div className="mb-1 leading-none text-slate-500">Top pick</div>
        <div className="text-2xl font-semibold">{title}</div>
        {option.type === "time" ? (
          <div className="text-slate-500">{`${dayjs(option.start).format(
            "LT",
          )} - ${dayjs(option.end).format("LT")}`}</div>
        ) : null}
      </div>
      <div>
        <DonutScore size="lg" yes={yes} ifNeedBe={ifNeedBe} no={no} />
      </div>
    </div>
  );
};

const Results = () => {
  const { participants } = useParticipants();
  const { poll } = usePoll();
  const { t } = useTranslation("app");
  const res = usePollOptionData(poll.options, participants);
  const optionsOrderedByPopularity = React.useMemo(() => {
    if (participants.length === 0) {
      return res.data;
    }
    return res.data.sort((a, b) => {
      if (b.yesCount === a.yesCount) {
        return b.ifNeedBeCount < a.ifNeedBeCount ? -1 : 1;
      }

      return b.yesCount > a.yesCount ? 1 : -1;
    });
  }, [participants.length, res]);

  const topPick = optionsOrderedByPopularity[0];

  return (
    <div
      className={clsx("space-y-4", {
        "opacity-50": participants.length === 0,
      })}
    >
      <div className="flex gap-4">
        <div className="flex grow items-start rounded-md border bg-white p-6">
          <div className="">
            <div className="mb-1 text-slate-500">{t("participants")}</div>
            <div className="text-3xl font-semibold">{participants.length}</div>
          </div>
        </div>
        <TopPick option={topPick} />
      </div>
      <Grid />
    </div>
  );
};
