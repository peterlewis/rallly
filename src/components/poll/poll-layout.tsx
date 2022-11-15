import clsx from "clsx";
import { t } from "i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";

import ClipboardCopy from "@/components/icons/clipboard-copy.svg";
import DotsHorizontal from "@/components/icons/dots-horizontal.svg";
import Pencil from "@/components/icons/pencil.svg";
import Trash from "@/components/icons/trash.svg";

import { useFormValidation } from "../../utils/form-validation";
import { trpc } from "../../utils/trpc";
import { Button } from "../button";
import Dropdown, { DropdownItem } from "../dropdown";
import { createModalHook } from "../modal/modal-provider";
import { usePoll } from "../poll-provider";
import { TextInput } from "../text-input";
import NotificationsToggle from "./notifications-toggle";

const MenuItem: React.VoidFunctionComponent<{
  href: string;
  children?: React.ReactNode;
}> = ({ href, children }) => {
  const router = useRouter();
  return (
    <Link
      className={clsx(
        "rounded p-2 text-slate-500 hover:bg-slate-500/5 hover:text-slate-500 hover:no-underline",
        {
          "pointer-events-none bg-slate-500/10": router.asPath === href,
        },
      )}
      href={href}
    >
      {children}
    </Link>
  );
};

const useTitleDialog = createModalHook(
  "titleDialog",
  function TitleDialog({ onDone }) {
    const { t } = useTranslation("app");
    const { poll, updatePoll } = usePoll();
    const { register, handleSubmit, formState } = useForm<{ title: string }>({
      defaultValues: {
        title: poll.title,
      },
    });

    const updateTitle = trpc.useMutation("polls.updateTitle", {
      onSuccess: ({ title }) => {
        updatePoll({ ...poll, title });
      },
    });

    const { requiredString } = useFormValidation();
    return (
      <form
        onSubmit={handleSubmit(async ({ title }) => {
          // update title
          await updateTitle.mutateAsync({ urlId: poll.adminUrlId, title });
          onDone();
        })}
      >
        <h3>{t("editTitle")}</h3>
        <fieldset className="mb-4">
          <label>{t("title")}</label>
          <TextInput
            data-autofocus={true}
            {...register("title", {
              validate: requiredString(t("title")),
            })}
          />
        </fieldset>
        <div className="action-group ">
          <Button
            loading={formState.isSubmitting}
            type="primary"
            htmlType="submit"
          >
            {t("save")}
          </Button>
          <Button onClick={onDone}>{t("cancel")}</Button>
        </div>
      </form>
    );
  },
);

const useDeleteDialog = createModalHook(
  "deleteDialog",
  function DeleteDialog({ onDone }) {
    const { t } = useTranslation("app");
    const { poll, updatePoll } = usePoll();
    const deletePoll = trpc.useMutation("polls.delete", {
      onSuccess: () => {
        onDone();
        updatePoll({ ...poll, deleted: true });
      },
    });

    return (
      <div>
        <h3>{t("areYouSure")}</h3>
        <p>
          <Trans
            t={t}
            i18nKey="deletePollConfirm"
            values={{ title: poll.title }}
            components={{ b: <strong /> }}
          />
        </p>
        <div className="action-group">
          <Button
            type="danger"
            loading={deletePoll.isLoading}
            onClick={() => {
              deletePoll.mutate({ urlId: poll.adminUrlId });
            }}
            htmlType="submit"
          >
            {t("delete")}
          </Button>
          <Button onClick={onDone}>{t("cancel")}</Button>
        </div>
      </div>
    );
  },
);

export const PollLayout: React.VoidFunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { poll } = usePoll();
  const titleDialog = useTitleDialog();

  const deleteDialog = useDeleteDialog();
  const { t } = useTranslation("app");
  return (
    <div className="">
      <div className="mb-4 text-2xl font-semibold">{poll.title}</div>
      <div className="mb-4 flex justify-between">
        <div className="action-group">
          <MenuItem href={`/poll/${poll.id}`}>Dashboard</MenuItem>
          <MenuItem href={`/poll/${poll.id}/manage`}>Manage</MenuItem>
        </div>

        <div className="action-group">
          <div className="action-group rounded-md bg-gray-100 text-sm">
            <div className="pl-2 font-mono text-slate-500">{`${window.location.origin}/p/${poll.participantUrlId}`}</div>
            <Button className="rounded-l-none" icon={<ClipboardCopy />} />
          </div>
          <NotificationsToggle />
          <Dropdown
            placement="bottom-end"
            trigger={<Button icon={<DotsHorizontal />} />}
          >
            <DropdownItem
              label={t("editTitle")}
              icon={Pencil}
              onClick={() => {
                titleDialog.show({
                  showClose: true,
                  size: "sm",
                });
              }}
            />
            <DropdownItem
              label={t("delete")}
              icon={Trash}
              onClick={() => {
                deleteDialog.show({
                  showClose: true,
                  size: "sm",
                });
              }}
            />
          </Dropdown>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};
