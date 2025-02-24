import { Button } from "@/components/ui/button";
import { MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { TQueryParams } from "@/types";

const ClearFilters = ({
  query,
  clearAllFilters,
  isMobile,
}: {
  clearAllFilters: (event: React.ChangeEvent<HTMLButtonElement>) => void;
  query: TQueryParams;
  isMobile?: boolean;
}) => {
  const canClearAllFilters = Boolean(
    query[MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery] ||
      query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] ||
      query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate] ||
      query[MODEL_LIST_FILTER_QUERY_PARAMS.id]
  );

  return (
    <div className={`${isMobile ? "block md:hidden" : "hidden md:block"}`}>
      {canClearAllFilters ? (
        // @ts-expect-error bad type definition
        <Button variant="tertiary" size="medium" onClick={clearAllFilters}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
};

export default ClearFilters;
