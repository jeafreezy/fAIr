import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { TModelPredictions } from "@/types";

export const ModelPredictionsTracker = ({
  modelPredictions,
  clearPredictions,
}: {
  modelPredictions: TModelPredictions;
  clearPredictions: () => void;
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <p className="text-nowrap text-body-3 font-medium text-dark">
        {START_MAPPING_PAGE_CONTENT.mapData.accepted}:{" "}
        {modelPredictions.accepted.length}{" "}
        {START_MAPPING_PAGE_CONTENT.mapData.rejected}:{" "}
        {modelPredictions.rejected.length}{" "}
      </p>
      {modelPredictions.accepted.length > 0 ||
      modelPredictions.rejected.length > 0 ||
      modelPredictions.all.length > 0 ? (
        <button
          className="rounded-md bg-gray px-3 py-0.5 text-body-3 text-white md:py-1"
          onClick={clearPredictions}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
};
