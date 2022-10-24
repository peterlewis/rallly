import { useTranslation } from "next-i18next";

import Plus from "@/components/icons/plus.svg";

import { Button } from "../../button";
import CompactButton from "../../compact-button";
import { ScrollSync } from "../../scroll-sync";
import { GridContext, useGrid } from "../grid-view-poll";
import { usePollStateContext } from "../poll-viz";
import UserAvatar from "../user-avatar";
import { GridBody } from "./grid/grid-body";
import { GridHeaderLayout } from "./grid/grid-header-layout";
import {
  GridPollOptionList,
  GridPollOptionsListInput,
} from "./grid/grid-options";

const GridHeader: React.VoidFunctionComponent = () => {
  const { t } = useTranslation("app");
  const {
    state,
    setState,
    options,
    createParticipant,
    updateParticipant,
    participants,
  } = usePollStateContext();
  switch (state.type) {
    case "create":
      return (
        <GridHeaderLayout
          topbar={
            <div
              key="create"
              className="flex items-center justify-between rounded-t-md bg-white py-2 pl-4 pr-2 font-medium"
            >
              <div>{t("pleaseChoose")}</div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  type="ghost"
                  onClick={() => {
                    setState({ type: "read" });
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    createParticipant(state.votes);
                  }}
                >
                  {t("continue")}
                </Button>
              </div>
            </div>
          }
          sidebar={<UserAvatar name={t("you")} showName={true} />}
        >
          <GridPollOptionsListInput
            value={state.votes}
            onChange={(votes) => {
              setState({ ...state, votes });
            }}
            options={options}
          />
        </GridHeaderLayout>
      );
    // case "select":
    //   const participant = getParticipant(state.participantId);
    //   return (
    //     <GridHeaderLayout
    //       topbar={
    //         <div
    //           key="select"
    //           className="flex items-center justify-between rounded-t-md bg-white py-2 px-2 font-medium"
    //         >
    //           {participant.editable ? (
    //             <>
    //               <div className=" flex items-center justify-end space-x-2">
    //                 <Button
    //                   type="danger"
    //                   onClick={() => {
    //                     deleteParticipant(state.participantId);
    //                   }}
    //                 >
    //                   {t("delete")}
    //                 </Button>
    //               </div>
    //               <div className="space-x-2">
    //                 <SegmentedButtonGroup>
    //                   <SegmentedButton
    //                     onClick={() => {
    //                       renameParticipant(state.participantId);
    //                     }}
    //                   >
    //                     {t("changeName")}
    //                   </SegmentedButton>
    //                   <SegmentedButton
    //                     onClick={() => {
    //                       setState({
    //                         type: "edit",
    //                         name: participant.name,
    //                         votes: participant.voteByOptionId,
    //                         participantId: participant.id,
    //                       });
    //                     }}
    //                   >
    //                     {t("editVotes")}
    //                   </SegmentedButton>
    //                 </SegmentedButtonGroup>
    //               </div>
    //             </>
    //           ) : (
    //             <div className="pl-2">
    //               You don't have permission to edit this participant
    //             </div>
    //           )}
    //           <div>
    //             <Button
    //               onClick={() => {
    //                 setState({ type: "read" });
    //               }}
    //             >
    //               {t("cancel")}
    //             </Button>
    //           </div>
    //         </div>
    //       }
    //       sidebar={<UserAvatar name={participant.name} showName={true} />}
    //     >
    //       <GridPollOptionsListValue
    //         options={options}
    //         value={participant.voteByOptionId}
    //       />
    //     </GridHeaderLayout>
    //   );
    case "edit":
      return (
        <GridHeaderLayout
          topbar={
            <div
              key="edit"
              className="flex items-center justify-between rounded-t-md bg-white py-2 pl-4 pr-2 font-medium"
            >
              <div>{t("pleaseChoose")}</div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  onClick={() => {
                    setState({
                      type: "select",
                      participantId: state.participantId,
                    });
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    updateParticipant(state.participantId, state.votes);
                  }}
                >
                  {t("save")}
                </Button>
              </div>
            </div>
          }
          sidebar={<UserAvatar name={state.name} showName={true} />}
        >
          <GridPollOptionsListInput
            value={state.votes}
            onChange={(votes) => {
              setState({ ...state, votes });
            }}
            options={options}
          />
        </GridHeaderLayout>
      );
    case "select":
    case "read":
      return (
        <GridHeaderLayout
          sidebar={
            <div className="flex h-full items-end">
              <div className="flex items-center space-x-2">
                <div className="font-medium">
                  {t("participantCount", {
                    count: participants.length,
                  })}
                </div>
                <CompactButton
                  icon={Plus}
                  onClick={() => {
                    setState({ type: "create", votes: {} });
                  }}
                />
              </div>
            </div>
          }
        >
          <GridPollOptionList options={options} />
        </GridHeaderLayout>
      );
  }
};

export const PollVizGrid: React.VoidFunctionComponent = () => {
  const { state, participants, options } = usePollStateContext();
  const { ref, props } = useGrid<HTMLDivElement>(options.length);
  return (
    <GridContext.Provider value={props}>
      <ScrollSync>
        <div
          className="max-w-full rounded-md border border-slate-400/20"
          ref={ref}
        >
          <GridHeader />
          <GridBody
            className="overflow-hidden rounded-b-md"
            participants={participants}
            selectedParticipantId={
              state.type === "select" || state.type === "edit"
                ? state.participantId
                : null
            }
          />
        </div>
      </ScrollSync>
    </GridContext.Provider>
  );
};
