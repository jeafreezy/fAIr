import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";
import { ButtonWithIcon } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { MapIcon, PenIcon } from "@/components/ui/icons";
import { APPLICATION_ROUTES, MODELS_CONTENT } from "@/constants";
import ModelDetailItem from "@/features/models/components/model-detail-item";
import ModelDetailsSection from "@/features/models/components/model-details-section";
import ModelFeedbacks from "@/features/models/components/model-feedbacks";
import { useDialog } from "@/hooks/use-dialog";
import { TModelDetails, TTrainingDataset } from "@/types";
import { formatDate, truncateString } from "@/utils";

import ModelDetailsUpdateDialog from "./dialogs/model-details-update-dialog";
import ModelFilesButton from "./model-files-button";
import { TrainingAreaButton } from "./training-area-button";

const ModelDetailsInfo = ({
  data,
  openModelFilesDialog,
  openTrainingAreaDrawer,
  trainingDataset,
  isError,
  isPending,
}: {
  data: TModelDetails;
  openModelFilesDialog: () => void;
  openTrainingAreaDrawer: () => void;
  trainingDataset: TTrainingDataset;
  isError: boolean;
  isPending: boolean;
}) => {
  const { isOpened, openDialog, closeDialog } = useDialog();
  const { user, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  return (
    <>
      <ModelDetailsUpdateDialog
        isOpened={isOpened}
        closeDialog={closeDialog}
        data={data}
      />
      <ModelDetailsSection title="">
        <div className="flex flex-col gap-y-8">
          <div className="inline-flex flex-col gap-y-4">
            <p className="text-body-2 text-gray">
              {MODELS_CONTENT.models.modelsDetailsCard.modelId} {data?.id}
            </p>
            <div className="flex w-full flex-col gap-y-8 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-y-4">
                <h1
                  className="text-wrap text-title-2 font-semibold text-dark md:text-large-title"
                  title={data?.name}
                >
                  {truncateString(data?.name, 40)}
                </h1>
                <p className="max-w-lg text-wrap text-body-3 text-gray md:max-w-xl md:text-body-2 xl:max-w-4xl">
                  {data?.description ??
                    MODELS_CONTENT.models.modelsDetailsCard
                      .modelDescriptionNotAvailable}
                </p>
              </div>
              <div className="max-w-fit">
                <ButtonWithIcon
                  label={MODELS_CONTENT.models.modelsDetailsCard.startMapping}
                  variant="primary"
                  size="medium"
                  prefixIcon={MapIcon}
                  disabled={data?.published_training === null}
                  onClick={() => {
                    navigate(
                      `${APPLICATION_ROUTES.START_MAPPING_BASE}${data.id}`
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <TrainingAreaButton
          onClick={openTrainingAreaDrawer}
          disabled={trainingDataset.source_imagery === null}
        />
      </ModelDetailsSection>
      <Divider />
      <ModelDetailsSection title="Details">
        <div className="grid grid-cols-1 gap-y-9 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col gap-y-4">
            <ModelDetailItem
              label={MODELS_CONTENT.models.modelsDetailsCard.createdBy}
              value={data?.user.username}
            />
            <ModelDetailItem
              label={MODELS_CONTENT.models.modelsDetailsCard.createdOn}
              value={formatDate(data?.created_at)}
            />
            <ModelDetailItem
              label={MODELS_CONTENT.models.modelsDetailsCard.lastModified}
              value={formatDate(data?.last_modified)}
            />
          </div>
          <div className="col-span-1 flex flex-col items-start justify-between gap-y-4">
            <div className="flex w-full flex-wrap gap-x-1 text-nowrap text-body-2 text-dark">
              <span className="text-gray">
                {MODELS_CONTENT.models.modelsDetailsCard.datasetName}
              </span>
              {isPending ? (
                <p className="ml-2 h-6 w-20 animate-pulse bg-light-gray"></p>
              ) : isError ? (
                <span>Error retrieving dataset info</span>
              ) : (
                <p title={trainingDataset?.name}>
                  {truncateString(trainingDataset?.name, 40)}
                </p>
              )}
            </div>
            <div className="flex gap-x-1 text-body-2 text-dark">
              <span className="text-gray">
                {MODELS_CONTENT.models.modelsDetailsCard.datasetId}
              </span>
              <p>{data?.dataset}</p>
            </div>
            <ModelFilesButton
              openModelFilesDialog={openModelFilesDialog}
              disabled={data?.published_training === null}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-y-4 md:items-end md:justify-between">
            <div>
              {isAuthenticated && user.osm_id === data.user.osm_id && (
                <button
                  className="flex items-center gap-x-4"
                  onClick={openDialog}
                >
                  <PenIcon className="icon" />{" "}
                  <span>
                    {" "}
                    {
                      MODELS_CONTENT.models.modelsDetailsCard.modelUpdate
                        .editButtonText
                    }
                  </span>
                </button>
              )}
            </div>
            <ModelFeedbacks trainingId={data?.published_training} />
          </div>
        </div>
      </ModelDetailsSection>
    </>
  );
};
export default ModelDetailsInfo;
