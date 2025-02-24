import { Map } from "maplibre-gl";

import { useCallback } from "react";

import { ToolTip } from "@/components/ui/tooltip";
import { START_MAPPING_PAGE_CONTENT, TOAST_NOTIFICATIONS } from "@/constants";
import { useGetModelPredictions } from "@/features/start-mapping/hooks/use-model-predictions";
import { TModelPredictions, TModelPredictionsConfig } from "@/types";
import { handleConflation, showErrorToast, showSuccessToast } from "@/utils";

const ModelAction = ({
  setModelPredictions,
  modelPredictions,
  trainingConfig,
  map,
  disablePrediction,
}: {
  trainingConfig: TModelPredictionsConfig;
  modelPredictions: TModelPredictions;
  setModelPredictions: React.Dispatch<React.SetStateAction<TModelPredictions>>;
  map: Map | null;
  disablePrediction: boolean;
}) => {
  const modelPredictionMutation = useGetModelPredictions({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast(
          TOAST_NOTIFICATIONS.startMapping.modelPrediction.success
        );
        const conflatedResults = handleConflation(
          modelPredictions,
          data.features,
          trainingConfig
        );
        setModelPredictions(conflatedResults);
      },
      onError: (error) => showErrorToast(error),
    },
  });

  const handlePrediction = useCallback(async () => {
    if (!map) return;
    await modelPredictionMutation.mutateAsync(trainingConfig);
  }, [trainingConfig, modelPredictionMutation, map]);

  return (
    <div className="flex flex-col-reverse flex-wrap gap-y-3  md:flex-row md:flex-nowrap md:items-center md:justify-between md:gap-x-2">
      <ToolTip
        content={
          disablePrediction ? START_MAPPING_PAGE_CONTENT.buttons.tooltip : null
        }
      >
        <button
          disabled={disablePrediction || modelPredictionMutation.isPending}
          onClick={handlePrediction}
          className={`w-full text-nowrap rounded-md bg-primary p-3 text-white md:py-1.5 ${disablePrediction || modelPredictionMutation.isPending ? "opacity-50" : ""}`}
        >
          <span className="text-sm capitalize">
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
