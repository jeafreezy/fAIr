import { handleConflation, showErrorToast, showSuccessToast } from "@/utils";
import { Map } from "maplibre-gl";
import { START_MAPPING_PAGE_CONTENT, TOAST_NOTIFICATIONS } from "@/constants";
import {
  BBOX,
  TModelDetails,
  TModelPredictions,
  TModelPredictionsConfig,
  TQueryParams,
} from "@/types";
import { ToolTip } from "@/components/ui/tooltip";
import { useCallback, useState } from "react";
import { useGetModelPredictions } from "@/features/start-mapping/hooks/use-model-predictions";
import { SEARCH_PARAMS } from "@/app/routes/start-mapping";
import { PREDICTION_API_FILE_EXTENSIONS } from "@/config";
import { BASE_MODELS } from "@/enums";
import { useParams } from "react-router-dom";

const ModelAction = ({
  setModelPredictions,
  modelPredictions,
  map,
  disablePrediction,
  query,
  currentZoom,
  modelInfo,
}: {
  modelPredictions: TModelPredictions;
  setModelPredictions: React.Dispatch<React.SetStateAction<TModelPredictions>>;
  map: Map | null;
  disablePrediction: boolean;
  query: TQueryParams;
  currentZoom: number;
  modelInfo: TModelDetails;
}) => {
  const { modelId } = useParams();
  const [predictionZoomLevel, setPredictionZoomLevel] = useState<number | null>(
    null,
  );

  const getTrainingConfig = useCallback((): TModelPredictionsConfig => {
    return {
      tolerance: query[SEARCH_PARAMS.tolerance] as number,
      area_threshold: query[SEARCH_PARAMS.area] as number,
      use_josm_q: query[SEARCH_PARAMS.useJOSMQ] as boolean,
      confidence: query[SEARCH_PARAMS.confidenceLevel] as number,
      checkpoint: `/mnt/efsmount/data/trainings/dataset_${modelInfo?.dataset?.id}/output/training_${modelInfo?.published_training}/checkpoint${PREDICTION_API_FILE_EXTENSIONS[modelInfo?.base_model as BASE_MODELS]}`,
      max_angle_change: 15,
      model_id: modelId as string,
      skew_tolerance: 15,
      source: modelInfo?.dataset?.source_imagery as string,
      zoom_level: predictionZoomLevel ?? currentZoom,
      bbox: [
        map?.getBounds().getWest(),
        map?.getBounds().getSouth(),
        map?.getBounds().getEast(),
        map?.getBounds().getNorth(),
      ] as BBOX,
    };
  }, [map, query, currentZoom, modelInfo, predictionZoomLevel]);

  const modelPredictionMutation = useGetModelPredictions({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast(
          TOAST_NOTIFICATIONS.startMapping.modelPrediction.success,
        );
        const conflatedResults = handleConflation(
          modelPredictions,
          data.features,
          {
            ...getTrainingConfig(),
            zoom_level: predictionZoomLevel ?? currentZoom,
          },
        );
        setModelPredictions(conflatedResults);
      },
      onError: (error) => showErrorToast(error),
    },
  });

  const handlePrediction = useCallback(async () => {
    if (!map) return;
    setPredictionZoomLevel(currentZoom);
    await modelPredictionMutation.mutateAsync(getTrainingConfig());
  }, [getTrainingConfig, modelPredictionMutation, map, currentZoom]);

  return (
    <div className="flex gap-y-3 flex-col-reverse flex-wrap  md:items-center md:flex-row md:justify-between md:gap-x-2 md:flex-nowrap">
      <ToolTip
        content={
          disablePrediction ? START_MAPPING_PAGE_CONTENT.buttons.tooltip : null
        }
      >
        <button
          disabled={disablePrediction || modelPredictionMutation.isPending}
          onClick={handlePrediction}
          className={`w-full text-nowrap bg-primary px-3 py-3 md:py-1.5 rounded-md text-white ${disablePrediction || modelPredictionMutation.isPending ? "opacity-50" : ""}`}
        >
          <span className="capitalize text-sm">
            {" "}
            {modelPredictionMutation.isPending
              ? START_MAPPING_PAGE_CONTENT.buttons.predictionInProgress
              : START_MAPPING_PAGE_CONTENT.buttons.runPrediction}
          </span>
        </button>
      </ToolTip>
    </div>
  );
};

export default ModelAction;
