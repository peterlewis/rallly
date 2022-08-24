import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";

import ChevronLeft from "@/components/icons/chevron-left.svg";

import { trpc } from "../utils/trpc";
import { AppLayout, AppLayoutHeading } from "./app-layout";
import { Button } from "./button";
import {
  PollDetailsForm,
  ProceedingDetailsStep,
} from "./create-poll/poll-details-step";
import { PollOptionsData, PollOptionsForm } from "./forms";

type NewPollState = {
  step: number;
  details: PollDetailsForm;
  options: PollOptionsData;
};

const initialState: NewPollState = {
  step: 0,
  details: {
    title: "",
    location: "",
    description: "",
  },
  options: {
    navigationDate: new Date().toISOString(),
    duration: 30,
    options: [],
    view: "month",
    timeZone: "",
  },
};

type NewPollAction =
  | { type: "back" }
  | { type: "loadState"; payload: NewPollState }
  | {
      type: "updateDetails";
      payload: PollDetailsForm;
    }
  | {
      type: "updateOptions";
      payload: PollOptionsData;
    };

const reducer = (state: NewPollState, action: NewPollAction): NewPollState => {
  switch (action.type) {
    case "updateDetails":
      return { ...state, step: 1, details: { ...action.payload } };
    case "updateOptions":
      return { ...state, step: 2, options: { ...action.payload } };
    case "loadState":
      return { ...action.payload };
    case "back":
      return { ...state, step: state.step - 1 };
  }
};

const NewPollContext =
  React.createContext<{
    state: NewPollState;
    dispatch: React.Dispatch<NewPollAction>;
  } | null>(null);

export const useNewProceeding = () => {
  const context = React.useContext(NewPollContext);

  if (!context) {
    throw new Error("Missing context provider for new proceeding");
  }

  return context;
};

const currentFormId = "new-proceeding";

const NewProceeding: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const router = useRouter();

  const isFirstStep = state.step === 0;

  const createPoll = trpc.useMutation(["polls.create"], {
    onSuccess: (res) => {
      router.replace(`/admin/${res.urlId}`);
    },
  });

  return (
    <AppLayout
      breadcrumbs={[
        {
          title: <>&larr; {t("groupMeetings")}</>,
          href: "/polls",
        },
      ]}
      title={t("newPoll")}
    >
      <NewPollContext.Provider value={{ state, dispatch }}>
        <AppLayoutHeading
          title={t("createPollTitle")}
          description={t("stepSummary", { current: state.step + 1, total: 2 })}
          className="mb-4"
        />
        <div className="h-full space-y-4">
          {(() => {
            switch (state.step) {
              case 0:
                return (
                  <ProceedingDetailsStep
                    formId={currentFormId}
                    defaultValues={state.details}
                    onSubmit={(payload) => {
                      dispatch({ type: "updateDetails", payload });
                    }}
                  />
                );
              case 1:
                return (
                  <PollOptionsForm
                    formId={currentFormId}
                    defaultValues={state.options}
                    onSubmit={async (payload) => {
                      const newState = { ...state, options: payload };
                      await createPoll.mutateAsync({
                        title: newState.details.title,
                        location: newState.details.location,
                        description: newState.details.description,
                        timeZone: newState.options.timeZone,
                        options: newState.options.options.map((option) =>
                          option.type === "date"
                            ? option.date
                            : `${option.start}/${option.end}`,
                        ),
                      });
                    }}
                  />
                );
            }
          })()}
        </div>
        <motion.div layout="position" className="mt-4 flex items-center">
          <div className="flex space-x-3">
            <Button
              disabled={isFirstStep}
              icon={<ChevronLeft />}
              onClick={() => dispatch({ type: "back" })}
            />
            <Button
              type="primary"
              loading={createPoll.isLoading}
              htmlType="submit"
              form={currentFormId}
            >
              <div>
                {state.step < 1 ? <>{t("continue")} &rarr;</> : t("createPoll")}
              </div>
            </Button>
          </div>
        </motion.div>
      </NewPollContext.Provider>
    </AppLayout>
  );
};

export default NewProceeding;
