import { useCallback } from "react";

import { Input } from "@/components/ui/form";
import { SearchIcon } from "@/components/ui/icons";
import { MODELS_CONTENT, MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { SHOELACE_SIZES } from "@/enums";
import { TQueryParams } from "@/types";

type SearchFilterProps = {
  query: TQueryParams;
  updateQuery: (param: TQueryParams) => void;
};

const SearchFilter: React.FC<SearchFilterProps> = ({ updateQuery, query }) => {
  const onSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateQuery({
        [MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery]: value,
      });
    },
    []
  );

  return (
    <div className={`flex max-w-[60%] items-center border border-gray-border`}>
      <SearchIcon className={`icon-lg ml-2 text-dark`} />
      <Input
        handleInput={onSearchInput}
        value={query[MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery] as string}
        placeholder={
          MODELS_CONTENT.models.modelsList.filtersSection.searchPlaceHolder
        }
        className="w-4/5"
        size={SHOELACE_SIZES.MEDIUM}
      />
    </div>
  );
};

export default SearchFilter;
