import { VoteType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import React from "react";
import { createStateContext } from "react-use";

import Menu from "@/components/icons/menu.svg";
import Logo from "~/public/logo.svg";

import { getBrowserTimeZone } from "../../utils/date-time-utils";
import { trpcNext } from "../../utils/trpc";
import { Button } from "../button";
import { useUser } from "../user-provider";
import { Confirmation } from "./participant-page/confirmation";
import { FirstStep } from "./participant-page/first-step";
import { ParticipantPageLayout } from "./participant-page/layout";
import { ParticipantDetailsForm } from "./participant-page/participant-details-form";
import { usePoll } from "./participant-page/poll-context";
import {
  TargetTimezone,
  TargetTimezoneProvider,
} from "./participant-page/target-timezone";

const AnimatedContainer: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      layout="position"
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {children}
    </motion.div>
  );
};

const useCreateParticipant = () => {
  return trpcNext.participant.add.useMutation();
};

export const ParticipantPage: React.VoidFunctionComponent = () => {
  const data = usePoll();

  const { t } = useTranslation("app");
  const [step, setStep] = React.useState(1);
  const { user } = useUser();
  const [votes, setVotes] = React.useState<Record<string, VoteType>>(() => {
    const v: Record<string, VoteType> = {};
    const participant = data?.participants.find(
      ({ userId }) => userId === user.id,
    );
    if (participant) {
      participant.votes.forEach(({ optionId, type }) => {
        v[optionId] = type;
      });
    }
    return v;
  });

  const createParticipant = useCreateParticipant();

  return (
    <TargetTimezoneProvider initialValue={getBrowserTimeZone()}>
      <ParticipantPageLayout>
        <motion.div layout="size">
          <AnimatePresence initial={false} exitBeforeEnter={true}>
            <AnimatedContainer key={step}>
              {step === 1 ? (
                <FirstStep
                  votes={votes}
                  onSubmit={(data) => {
                    setVotes(
                      data.value.reduce<Record<string, VoteType>>(
                        (acc, curr) => {
                          acc[curr.id] = curr.vote ?? "no";
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
                          ([optionId, vote]) => ({
                            optionId,
                            vote,
                          }),
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
      </ParticipantPageLayout>
    </TargetTimezoneProvider>
  );
};
