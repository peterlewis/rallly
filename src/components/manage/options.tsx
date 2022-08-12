import { Trans, useTranslation } from "next-i18next";

import { encodeDateOption, parseValue } from "../../utils/date-time-utils";
import { Button } from "../button";
import { PollOptionsForm } from "../forms";
import { useModalContext } from "../modal/modal-provider";
import { usePoll } from "../poll-context";
import { usePollMutations } from "../use-poll-mutations";

const formId = "update-options";

export const Options: React.VFC = () => {
  const { poll, getParticipantsWhoVotedForOption } = usePoll();
  const firstOption = parseValue(poll.options[0].value);
  const navigationDate =
    firstOption.type === "date" ? firstOption.date : firstOption.start;

  const { updatePoll } = usePollMutations();
  const { t } = useTranslation("app");
  const modalContext = useModalContext();

  return (
    <div className="space-y-4">
      <PollOptionsForm
        formId={formId}
        defaultValues={{
          navigationDate, // used to navigate to the right part of the calendar
          duration: 30, // duration of the event in minutes
          timeZone: poll.timeZone ?? "",
          view: "month",
          options: poll.options.map(({ value }) => parseValue(value)),
        }}
        onSubmit={async (data) => {
          const encodedOptions = data.options.map(encodeDateOption);
          const optionsToDelete = poll.options.filter((option) => {
            return !encodedOptions.includes(option.value);
          });

          const optionsToAdd = encodedOptions.filter(
            (encodedOption) =>
              !poll.options.find((o) => o.value === encodedOption),
          );

          const onOk = async () => {
            await updatePoll.mutateAsync({
              urlId: poll.adminUrlId,
              timeZone: data.timeZone,
              optionsToDelete: optionsToDelete.map(({ id }) => id),
              optionsToAdd,
            });
          };

          const optionsToDeleteThatHaveVotes = optionsToDelete.filter(
            (option) => getParticipantsWhoVotedForOption(option.id).length > 0,
          );

          if (optionsToDeleteThatHaveVotes.length > 0) {
            modalContext.render({
              title: "Are you sure?",
              description: (
                <Trans
                  t={t}
                  i18nKey="deletingOptionsWarning"
                  components={{ b: <strong /> }}
                />
              ),
              onOk,
              okButtonProps: {
                type: "danger",
              },
              okText: "Delete",
              cancelText: "Cancel",
            });
          } else {
            onOk();
          }
        }}
      />
      <div>
        <Button
          htmlType="submit"
          loading={updatePoll.isLoading}
          form={formId}
          type="primary"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
};
