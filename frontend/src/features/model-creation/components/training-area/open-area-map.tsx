import { Map } from "maplibre-gl";

import { useCallback, useEffect } from "react";

import { useModelsContext } from "@/app/providers/models-provider";
import { FullScreenIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { MODELS_CONTENT } from "@/constants";
import { MODEL_CREATION_FORM_NAME } from "@/enums";
import { useGetTMSTileJSON } from "@/features/model-creation/hooks/use-tms-tilejson";
import { useGetTrainingDataset } from "@/features/models/hooks/use-dataset";
import { showErrorToast } from "@/utils";

const OpenAerialMap = ({
  tileJSONURL,
  map,
  trainingDatasetId,
}: {
  tileJSONURL: string;
  map: Map | null;
  trainingDatasetId: number;
}) => {
  const { handleChange } = useModelsContext();

  const { isPending, data, isError } = useGetTMSTileJSON(tileJSONURL);

  const { data: trainingDataset, isError: trainingDatasetFetchError } =
    useGetTrainingDataset(trainingDatasetId);

  useEffect(() => {
    if (trainingDatasetFetchError) {
      showErrorToast("Failed to fetch training dataset");
    }
  }, [trainingDatasetFetchError]);

  const fitToTMSBounds = useCallback(() => {
    if (!map || !data?.bounds) return;
    map?.fitBounds(data?.bounds);
  }, [map, data?.bounds]);

  useEffect(() => {
    if (!data) return;
    handleChange(MODEL_CREATION_FORM_NAME.OAM_BOUNDS, data.bounds);
    handleChange(MODEL_CREATION_FORM_NAME.OAM_TILE_NAME, data.name);
  }, [data]);

  useEffect(() => {
    if (!map || !data?.bounds) return;
    fitToTMSBounds();
  }, [map, fitToTMSBounds]);

  return (
    <div className="flex w-full flex-col  gap-y-2 border-b-8 border-off-white px-4 py-2 pb-4">
      <p className="text-body-2 font-medium md:text-body-1">
        {MODELS_CONTENT.modelCreation.trainingArea.form.openAerialMap}
      </p>
      <div className="flex w-full flex-col items-center justify-between gap-y-4">
        {isError ? (
          <p>
            {
              MODELS_CONTENT.modelCreation.trainingArea
                .openAerialMapErrorMessage
            }
          </p>
        ) : isPending ? (
          <div className="h-20 w-full animate-pulse bg-gray-border"></div>
        ) : (
          <>
            <div className="flex w-full justify-between gap-x-3">
              <p
                className="w-full basis-4/5 overflow-hidden text-ellipsis text-wrap text-start text-body-3"
                title={data?.name}
              >
                {trainingDataset?.name}
              </p>
              <ToolTip
                content={
                  MODELS_CONTENT.modelCreation.trainingArea.toolTips
                    .fitToTMSBounds
                }
              >
                <button
                  className="size-fit rounded-md bg-off-white p-2 "
                  disabled={!map || isPending || isError}
                  onClick={fitToTMSBounds}
                >
                  <FullScreenIcon className="icon-lg" />
                </button>
              </ToolTip>
            </div>
            <div className="flex w-full items-center justify-between gap-x-4">
              <p className="text-body-4">
                {MODELS_CONTENT.modelCreation.trainingArea.form.maxZoom}{" "}
                {data?.maxzoom ?? 0}
              </p>
              <p className="text-body-4">
                {MODELS_CONTENT.modelCreation.trainingArea.form.minZoom}{" "}
                {data?.minzoom ?? 0}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OpenAerialMap;
