import { Polygon } from "geojson";

import { useEffect, useState } from "react";

import { geojsonToWKT } from "@terraformer/wkt";

import { useModelsContext } from "@/app/providers/models-provider";
import { Button, ButtonWithIcon } from "@/components/ui/button";
import { UploadIcon, YouTubePlayIcon } from "@/components/ui/icons";
import { MODELS_CONTENT, TOAST_NOTIFICATIONS } from "@/constants";
import {
  DrawingModes,
  MODEL_CREATION_FORM_NAME,
  SHOELACE_SIZES,
} from "@/enums";
import { StepHeading } from "@/features/model-creation/components/";
import FileUploadDialog from "@/features/model-creation/components/dialogs/file-upload-dialog";
import OpenAerialMap from "@/features/model-creation/components/training-area/open-area-map";
import TrainingAreaList from "@/features/model-creation/components/training-area/training-area-list";
import TrainingAreaMap from "@/features/model-creation/components/training-area/training-area-map";
import {
  useCreateTrainingArea,
  useGetTrainingAreas,
} from "@/features/model-creation/hooks/use-training-areas";
import { useDialog } from "@/hooks/use-dialog";
import { useMapInstance } from "@/hooks/use-map-instance";
import useScreenSize from "@/hooks/use-screen-size";
import {
  extractTileJSONURL,
  showSuccessToast,
  snapGeoJSONPolygonToClosestTile,
} from "@/utils";

const TrainingAreaForm = () => {
  const { formData } = useModelsContext();
  const {
    map,
    mapContainerRef,
    drawingMode,
    setDrawingMode,
    terraDraw,
    currentZoom,
  } = useMapInstance();
  const tileJSONURL = extractTileJSONURL(formData.tmsURL);

  const { closeDialog, isOpened, toggle } = useDialog();
  const { handleChange } = useModelsContext();
  const [offset, setOffset] = useState<number>(0);
  const {
    data: trainingAreasData,
    isPending: trainingAreaIsPending,
    isPlaceholderData,
  } = useGetTrainingAreas(Number(formData.selectedTrainingDatasetId), offset);

  useEffect(() => {
    if (!trainingAreasData) return;
    // update the form data when the data changes
    handleChange(
      MODEL_CREATION_FORM_NAME.TRAINING_AREAS,
      // @ts-expect-error bad type definition
      trainingAreasData?.results.features
    );
  }, [trainingAreasData]);

  const createTrainingArea = useCreateTrainingArea({
    datasetId: Number(formData.selectedTrainingDatasetId),
    offset: offset,
  });

  const fileUploadHandler = async (polygonGeometry: Polygon) => {
    snapGeoJSONPolygonToClosestTile(polygonGeometry);
    const wkt = geojsonToWKT(polygonGeometry);
    await createTrainingArea.mutateAsync({
      dataset: formData.selectedTrainingDatasetId,
      geom: `SRID=4326;${wkt}`,
    });
  };

  return (
    <>
      <FileUploadDialog
        isOpened={isOpened}
        closeDialog={closeDialog}
        label={"Upload Training Area(s)"}
        fileUploadHandler={fileUploadHandler}
        successToast={TOAST_NOTIFICATIONS.trainingAreasFileUploadSuccess}
        disabled={createTrainingArea.isPending}
      />
      <div className="mb-40 flex min-h-screen flex-col md:h-screen">
        <div className="mb-10 flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between">
          <div className="basis-2/3">
            <StepHeading
              heading={MODELS_CONTENT.modelCreation.trainingArea.pageTitle}
              description={
                MODELS_CONTENT.modelCreation.trainingArea.pageDescription
              }
            />
          </div>
          <div className="flex flex-col gap-y-4 md:items-end ">
            <p className="flex items-center gap-x-2">
              <YouTubePlayIcon className="icon-lg" />
              {MODELS_CONTENT.modelCreation.trainingArea.tutorialText}
            </p>
            <p className="text-dark">
              {MODELS_CONTENT.modelCreation.trainingArea.datasetID}{" "}
              {formData.selectedTrainingDatasetId}
            </p>
          </div>
        </div>

        <div className="fullscreen md:no-fullscreen mb-10 border-x-8 border-t-8 border-off-white md:hidden">
          <OpenAerialMap
            tileJSONURL={tileJSONURL}
            map={map}
            trainingDatasetId={Number(formData.selectedTrainingDatasetId)}
          />
        </div>
        <div className="fullscreen md:no-fullscreen grid h-full  grid-cols-12 border-8 border-off-white md:grid-cols-9">
          <div className="col-span-12 h-[90vh] w-full md:col-span-6 2xl:col-span-7">
            <TrainingAreaMap
              tileJSONURL={tileJSONURL}
              data={trainingAreasData}
              trainingDatasetId={Number(formData.selectedTrainingDatasetId)}
              offset={offset}
              map={map}
              mapContainerRef={mapContainerRef}
              terraDraw={terraDraw}
              setDrawingMode={setDrawingMode}
              drawingMode={drawingMode}
              currentZoom={currentZoom}
            />
          </div>
          <div className="col-span-12 hidden h-[90vh] max-h-screen w-full flex-col gap-y-6 border-l-8 border-off-white py-4 md:col-span-3 md:flex 2xl:col-span-2 ">
            <OpenAerialMap
              tileJSONURL={tileJSONURL}
              map={map}
              trainingDatasetId={Number(formData.selectedTrainingDatasetId)}
            />
            <TrainingAreaList
              offset={offset}
              setOffset={setOffset}
              isPlaceholderData={isPlaceholderData}
              data={trainingAreasData}
              isPending={trainingAreaIsPending}
              datasetId={Number(formData.selectedTrainingDatasetId)}
              map={map}
            />
            <ActionButtons
              toggle={toggle}
              trainingAreasDataCount={trainingAreasData?.count}
              setDrawingMode={setDrawingMode}
            />
          </div>
        </div>

        <div className="fullscreen md:no-fullscreen border-8 border-off-white py-2 md:hidden">
          <div className="h-[60vh]  overflow-y-auto ">
            <TrainingAreaList
              offset={offset}
              setOffset={setOffset}
              isPlaceholderData={isPlaceholderData}
              data={trainingAreasData}
              isPending={trainingAreaIsPending}
              datasetId={Number(formData.selectedTrainingDatasetId)}
              map={map}
            />
          </div>
          <div className="py-2">
            <ActionButtons
              toggle={toggle}
              trainingAreasDataCount={trainingAreasData?.count}
              setDrawingMode={setDrawingMode}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingAreaForm;

const ActionButtons = ({
  trainingAreasDataCount,
  setDrawingMode,
  toggle,
}: {
  trainingAreasDataCount?: number;
  setDrawingMode: (mode: DrawingModes) => void;
  toggle: () => void;
}) => {
  const { isTablet } = useScreenSize();
  return (
    <div
      className={`mt-auto flex w-full gap-y-2 px-4 md:px-1  lg:px-4 ${trainingAreasDataCount === 0 ? "w-full flex-col" : "items-center justify-between gap-x-1 md:gap-x-2 "}"`}
    >
      <div className="w-full">
        <Button
          variant="primary"
          size={isTablet ? SHOELACE_SIZES.SMALL : SHOELACE_SIZES.MEDIUM}
          onClick={() => {
            setDrawingMode(DrawingModes.RECTANGLE);
            showSuccessToast(TOAST_NOTIFICATIONS.drawingModeActivated);
          }}
        >
          <div className="flex items-center gap-x-1 md:gap-x-2">
            <p>{MODELS_CONTENT.modelCreation.trainingArea.form.draw}</p>
            <div className="size-4 rounded-md border-2 border-white"></div>
          </div>
        </Button>
      </div>
      <div className="w-full">
        <ButtonWithIcon
          size={isTablet ? SHOELACE_SIZES.SMALL : SHOELACE_SIZES.MEDIUM}
          label={MODELS_CONTENT.modelCreation.trainingArea.form.upload}
          variant="dark"
          suffixIcon={UploadIcon}
          onClick={toggle}
        />
      </div>
    </div>
  );
};
