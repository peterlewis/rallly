import clsx from "clsx";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { usePlausible } from "next-plausible";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Discussion from "@/components/discussion";
import Chart from "@/components/icons/chart.svg";
import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import DocumentText from "@/components/icons/document-text.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import LocationMarker from "@/components/icons/location-marker.svg";
import LockClosed from "@/components/icons/lock-closed.svg";
import Pencil from "@/components/icons/pencil.svg";

import { DayjsProvider } from "../utils/dayjs";
import { trpc } from "../utils/trpc";
import { NewLayout } from "./app-layout";
import { Button } from "./button";
import ModalProvider from "./modal/modal-provider";
import { useParticipants } from "./participants-provider";
import NotificationsToggle from "./poll/notifications-toggle";
import { ConnectedPollViz } from "./poll/poll-viz";
import { useTouchBeacon } from "./poll/use-touch-beacon";
import { UserAvatarProvider } from "./poll/user-avatar";
import { usePoll } from "./poll-provider";
import { EditableSection, Section } from "./section";
import { TextInput } from "./text-input";
import { usePollMutations } from "./use-poll-mutations";

// const Legend = () => {
//   const { t } = useTranslation("app");
//   return (
//     <div className="flex h-8 items-center space-x-3">
//       <span className="inline-flex items-center space-x-1">
//         <VoteIcon type="yes" />
//         <span className="text-sm text-slate-500">{t("yes")}</span>
//       </span>
//       <span className="inline-flex items-center space-x-1">
//         <VoteIcon type="ifNeedBe" />
//         <span className="text-sm text-slate-500">{t("ifNeedBe")}</span>
//       </span>
//       <span className="inline-flex items-center space-x-1">
//         <VoteIcon type="no" />
//         <span className="text-sm text-slate-500">{t("no")}</span>
//       </span>
//     </div>
//   );
// };

// const ClipboardLink: React.VoidFunctionComponent<{
//   className?: string;
//   url: string;
//   description: React.ReactNode;
//   title: string;
//   icon: React.ComponentType<{ className?: string }>;
// }> = ({ title, icon: Icon, url, description, className }) => {
//   const { t } = useTranslation("app");
//   const [state, copyToClipboard] = useCopyToClipboard();

//   const [didCopy, setDidCopy] = React.useState(false);
//   const inputRef = React.useRef<HTMLInputElement>(null);
//   return (
//     <div className={className}>
//       <div className={clsx("mb-2 flex items-center space-x-2")}>
//         <div className="flex items-center">
//           <Icon className="mr-2 h-5 text-primary-500" />
//           <span className="font-semibold">{title}</span>
//         </div>
//         {state.error?.message ? (
//           <span className="text-red-500">{state.error.message}</span>
//         ) : null}
//         <AnimatePresence>
//           {didCopy ? (
//             <motion.span
//               transition={{ duration: 0.2 }}
//               initial={{ opacity: 0, y: 10, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.2 }}
//               className="text-xs text-gray-400"
//             >
//               {t("copied")}
//             </motion.span>
//           ) : null}
//         </AnimatePresence>
//       </div>
//       <div
//         onClick={() => {
//           inputRef.current?.select();
//         }}
//         className="mb-2 flex divide-x overflow-hidden rounded-md border bg-white"
//       >
//         <input
//           ref={inputRef}
//           readOnly={true}
//           value={url}
//           className={clsx(
//             "grow py-2 pl-2 text-slate-700 transition-opacity sm:text-base",
//             {
//               "bg-slate-500/5": didCopy,
//             },
//           )}
//         />
//         <button
//           onClick={() => {
//             setDidCopy(true);
//             copyToClipboard(url);
//             setTimeout(() => {
//               setDidCopy(false);
//             }, 1000);
//           }}
//           type="button"
//           className={clsx("py-2 px-3 hover:bg-gray-50 active:bg-slate-500/10", {
//             "text-green-500": didCopy,
//             "text-slate-500": !didCopy,
//           })}
//         >
//           {didCopy ? (
//             <ClipboardCheck className="h-5" />
//           ) : (
//             <ClipboardCopy className="h-5" />
//           )}
//         </button>
//       </div>
//       <div className="text-gray-400">{description}</div>
//     </div>
//   );
// };

const trimValue = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const DescriptionForm: React.VoidFunctionComponent<{ onDone: () => void }> = ({
  onDone,
}) => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  const { register, handleSubmit, formState } = useForm<{
    description: string;
  }>({
    defaultValues: { description: poll.description ?? "" },
  });
  const queryClient = trpc.useContext();
  const updateDescription = trpc.useMutation("polls.updateDescription", {
    onMutate: ({ description }) => {
      queryClient.setQueryData(
        ["polls.get", { urlId: poll.adminUrlId, admin: true }],
        (poll) => {
          if (!poll) {
            throw new Error("Expected poll to be set");
          }

          return { ...poll, description };
        },
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async ({ description }) => {
        onDone();
        // update description
        toast.promise(
          updateDescription.mutateAsync({
            urlId: poll.adminUrlId,
            description: trimValue(description),
          }),
          {
            loading: t("saving"),
            success: t("saved"),
            error: t("saveFailed"),
          },
        );
      })}
      className="space-y-2"
    >
      <textarea
        autoFocus={true}
        rows={3}
        readOnly={formState.isSubmitting}
        className="input w-full text-lg"
        {...register("description")}
      />
      <div className="action-group">
        <Button
          loading={formState.isSubmitting}
          type="primary"
          htmlType="submit"
        >
          {t("save")}
        </Button>
        <Button
          onClick={() => {
            onDone();
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
};

const DescriptionSection = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();

  return (
    <EditableSection
      icon={DocumentText}
      title={t("description")}
      editText={t("editDescription")}
    >
      {({ isEditing, stopEditing }) => {
        if (isEditing) {
          return <DescriptionForm onDone={stopEditing} />;
        }
        return (
          <div
            className={clsx("text-lg", {
              "text-slate-400": !poll.description,
            })}
          >
            {poll.description || t("notSpecified")}
          </div>
        );
      }}
    </EditableSection>
  );
};

const LocationForm: React.VoidFunctionComponent<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();
  const { register, handleSubmit, formState } = useForm<{
    location: string;
  }>({
    defaultValues: { location: poll.location ?? "" },
  });
  const queryClient = trpc.useContext();
  const updateLocation = trpc.useMutation("polls.updateLocation", {
    onMutate: ({ location }) => {
      queryClient.setQueryData(
        ["polls.get", { urlId: poll.adminUrlId, admin: true }],
        (poll) => {
          if (!poll) {
            throw new Error("Expected poll to be set");
          }

          return { ...poll, location };
        },
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async ({ location }) => {
        onClose();
        toast.promise(
          updateLocation.mutateAsync({
            urlId: poll.adminUrlId,
            location: trimValue(location),
          }),
          {
            loading: t("saving"),
            success: t("saved"),
            error: t("saveFailed"),
          },
        );
      })}
      className="space-y-2"
    >
      <TextInput
        autoFocus={true}
        className="text-lg"
        readOnly={formState.isSubmitting}
        placeholder={t("notSpecified")}
        {...register("location")}
      />
      <div className="action-group">
        <Button
          loading={formState.isSubmitting}
          type="primary"
          htmlType="submit"
        >
          {t("save")}
        </Button>
        <Button onClick={onClose}>{t("cancel")}</Button>
      </div>
    </form>
  );
};

const LocationSection = () => {
  const { t } = useTranslation("app");
  const { poll } = usePoll();

  return (
    <EditableSection
      icon={LocationMarker}
      title={t("location")}
      editText={t("editLocation")}
    >
      {({ isEditing, stopEditing }) => {
        if (isEditing) {
          return <LocationForm onClose={stopEditing} />;
        }
        return (
          <div
            className={clsx("text-lg", {
              "text-slate-400": !poll.location,
            })}
          >
            {poll.location || t("notSpecified")}
          </div>
        );
      }}
    </EditableSection>
  );
};

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
    <DayjsProvider>
      <ModalProvider>
        <NewLayout
          title={poll.title}
          actions={
            <div className="action-group">
              <NotificationsToggle />
              <Button icon={<DotsHorizontal />} />
            </div>
          }
          backHref="/polls"
        >
          <UserAvatarProvider seed={poll.id} names={names}>
            <Head>
              <title>{poll.title}</title>
              <meta name="robots" content="noindex,nofollow" />
            </Head>
            <div className="mx-auto max-w-4xl sm:space-y-4">
              {poll.closed ? (
                <div className="mobile:edge-4 flex bg-blue-300/10 px-4 py-3 text-blue-800/75 sm:rounded-md">
                  <div className="mr-2 rounded-md">
                    <LockClosed className="w-6" />
                  </div>
                  <div>{t("pollHasBeenLocked")}</div>
                </div>
              ) : null}
              <div className="space-y-6 py-6">
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
                <div className="-mx-3 flex items-center justify-center rounded-md border">
                  <div className="px-4 font-medium text-slate-500">
                    {t("participantLink")}
                  </div>
                  <div className="grow font-mono">
                    {`${window.location.origin}/p/${poll.participantUrlId}`}
                  </div>
                  <div className="ml-2 p-2">
                    <Button icon={<ClipboardCopy />}>{t("copyLink")}</Button>
                  </div>
                </div>
                <DescriptionSection />
                <LocationSection />
                <Section
                  title={t("poll")}
                  icon={Chart}
                  actions={
                    <div className="action-group">
                      <Button icon={<Pencil />}>{t("editOptions")}</Button>
                    </div>
                  }
                >
                  {participants ? <ConnectedPollViz /> : null}
                </Section>
                <Discussion />
              </div>
            </div>
          </UserAvatarProvider>
        </NewLayout>
      </ModalProvider>
    </DayjsProvider>
  );
};

export default PollPage;
