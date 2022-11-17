import { VoteType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import { DayjsProvider } from "../../utils/dayjs";
import { trpcNext } from "../../utils/trpc";
import { Button } from "../button";
import FullPageLoader from "../full-page-loader";
import { Confirmation } from "./participant-page/confirmation";
import { FirstStep } from "./participant-page/first-step";
import { ParticipantDetailsForm } from "./participant-page/participant-details-form";

export const usePoll = () => {
  const router = useRouter();
  return trpcNext.poll.getByParticipantLinkId.useQuery({
    id: router.query.participantLinkId as string,
  });
};

const AnimatedContainer: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

const useCreateParticipant = () => {
  return trpcNext.participant.add.useMutation();
};

export const ParticipantPage: React.VoidFunctionComponent = () => {
  const { data } = usePoll();

  const { t } = useTranslation("app");

  const [step, setStep] = React.useState(1);
  const [votes, setVotes] = React.useState<Record<string, VoteType>>({});

  const createParticipant = useCreateParticipant();

  if (!data) {
    return <FullPageLoader>{t("loading")}</FullPageLoader>;
  }

  return (
    <DayjsProvider>
      <Head>
        <title>{data.title}</title>
      </Head>
      <div className="line-pattern h-full overflow-auto p-4">
        <motion.div
          layout="size"
          className="mx-auto max-w-2xl overflow-hidden rounded border bg-white p-6 shadow"
        >
          <AnimatePresence initial={false} exitBeforeEnter={true}>
            <AnimatedContainer key={step}>
              {step === 1 ? (
                <FirstStep
                  votes={votes}
                  onSubmit={(data) => {
                    setVotes(
                      data.value.reduce<Record<string, VoteType>>(
                        (acc, curr) => {
                          acc[curr.id] = curr.value ?? "no";
                          return acc;
                        },
                        {},
                      ),
                    );
                    setStep(2);
                  }}
                />
              ) : step === 2 ? (
                <>
                  <div className="mb-3">
                    <Button onClick={() => setStep(1)}>{t("back")}</Button>
                  </div>
                  <ParticipantDetailsForm
                    onSubmit={async (user) => {
                      await createParticipant.mutateAsync({
                        name: user.name,
                        email: user.email,
                        id: data.id,
                        votes: Object.entries(votes).map(
                          ([optionId, vote]) => ({ optionId, vote }),
                        ),
                      });
                      // create participant
                      setStep(3);
                    }}
                  />
                </>
              ) : (
                <Confirmation />
              )}
            </AnimatedContainer>
          </AnimatePresence>
        </motion.div>
      </div>
    </DayjsProvider>
  );
};
