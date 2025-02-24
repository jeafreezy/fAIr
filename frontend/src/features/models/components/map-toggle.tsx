import { Switch } from "@/components/ui/form";
import { MODELS_CONTENT, MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { LayoutView } from "@/enums";
import { TQueryParams } from "@/types";

const ModelMapToggle = ({
  query,
  updateQuery,
  isMobile,
}: {
  updateQuery: (params: TQueryParams) => void;
  query: TQueryParams;
  isMobile?: boolean;
}) => {
  return (
    <div
      className={`${isMobile ? "inline-flex md:hidden" : "hidden md:inline-flex"} items-center gap-x-4`}
      role="button"
    >
      <p className="text-nowrap text-body-2base">
        {MODELS_CONTENT.models.modelsList.filtersSection.mapViewToggleText}
      </p>
      <Switch
        checked={query[MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive] as boolean}
        disabled={
          query[MODEL_LIST_FILTER_QUERY_PARAMS.layout] == LayoutView.LIST
        }
        handleSwitchChange={() => {
          updateQuery({
            [MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive]:
              !query[MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive],
          });
        }}
      />
    </div>
  );
};

export default ModelMapToggle;
