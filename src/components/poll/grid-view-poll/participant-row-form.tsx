import clsx from "clsx";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { requiredString } from "../../../utils/form-validation";
import NameInput from "../../name-input";
import { ParticipantForm, PollViewOption } from "../types";
import { VoteSelector } from "../vote-selector";
import ControlledScrollArea from "./controlled-scroll-area";
import { usePollContext } from "./poll-context";

export interface ParticipantRowFormProps {
  options: PollViewOption[];
  defaultValues?: Partial<ParticipantForm>;
  onSubmit: (data: ParticipantForm) => Promise<void>;
  className?: string;
  onCancel?: () => void;
}

const ParticipantRowForm: React.ForwardRefRenderFunction<
  HTMLFormElement,
  ParticipantRowFormProps
> = ({ defaultValues, onSubmit, className, onCancel, options }, ref) => {
  const { t } = useTranslation("app");
  const {
    columnWidth,
    scrollPosition,
    sidebarWidth,
    numberOfColumns,
    goToNextPage,
    setScrollPosition,
  } = usePollContext();

  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      votes: [],
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    });
  }, [onCancel]);

  const isColumnVisible = (index: number) => {
    return scrollPosition + numberOfColumns * columnWidth > columnWidth * index;
  };

  const checkboxRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  return (
    <form
      id="participant-row-form"
      ref={ref}
      onSubmit={handleSubmit(async ({ name, votes }) => {
        await onSubmit({
          name,
          votes: votes.map((v) => v ?? "no"),
        });
        reset();
      })}
      className={clsx("flex h-14 shrink-0", className)}
    >
      <div
        className="flex shrink-0 items-center px-2 pl-6"
        style={{ width: sidebarWidth }}
      >
        <Controller
          name="name"
          rules={{
            validate: requiredString,
          }}
          render={({ field }) => (
            <div className="w-full">
              <NameInput
                className={clsx("w-full", {
                  "input-error": errors.name && submitCount > 0,
                })}
                placeholder={t("yourName")}
                {...field}
                onKeyDown={(e) => {
                  if (
                    (e.code === "Tab" || e.code === "Enter") &&
                    scrollPosition > 0
                  ) {
                    e.preventDefault();
                    setScrollPosition(0);
                    setTimeout(() => {
                      checkboxRefs.current[0]?.focus();
                    }, 100);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.code === "Enter") {
                    e.preventDefault();
                    checkboxRefs.current[0]?.focus();
                  }
                }}
              />
            </div>
          )}
          control={control}
        />
      </div>
      <Controller
        control={control}
        name="votes"
        render={({ field }) => {
          return (
            <ControlledScrollArea>
              {options.map((_, index) => {
                const value = field.value[index];

                return (
                  <div
                    key={index}
                    className="flex shrink-0 items-center justify-center px-2"
                    style={{ width: columnWidth }}
                  >
                    <VoteSelector
                      value={value}
                      onKeyDown={(e) => {
                        if (
                          e.code === "Tab" &&
                          index < options.length - 1 &&
                          !isColumnVisible(index + 1)
                        ) {
                          e.preventDefault();
                          goToNextPage();
                          setTimeout(() => {
                            checkboxRefs.current[index + 1]?.focus();
                          }, 100);
                        }
                      }}
                      onChange={(vote) => {
                        const newValue = [...field.value];
                        newValue[index] = vote;
                        field.onChange(newValue);
                      }}
                      ref={(el) => {
                        checkboxRefs.current[index] = el;
                      }}
                    />
                  </div>
                );
              })}
            </ControlledScrollArea>
          );
        }}
      />
    </form>
  );
};

export default React.forwardRef(ParticipantRowForm);
