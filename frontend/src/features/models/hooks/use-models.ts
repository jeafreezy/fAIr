import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { PAGE_LIMIT } from "@/components/shared";
import {
  MODELS_LIST_DATE_FILTERS,
  MODEL_LIST_FILTER_QUERY_PARAMS,
  ORDERING_FIELDS,
} from "@/constants";
import { LayoutView } from "@/enums";
import {
  getModelDetailsQueryOptions,
  getModelsMapDataQueryOptions,
  getModelsQueryOptions,
} from "@/features/models/api/factory";
import useDebounce from "@/hooks/use-debounce";
import { TQueryParams } from "@/types";
import { buildDateFilterQueryString } from "@/utils";

type UseModelsOptions = {
  limit: number;
  offset: number;
  orderBy: string;
  searchQuery: string;
  dateFilters: Record<string, string>;
  status: number;
  id: number;
  userId?: number;
};

export const useModels = ({
  limit,
  offset,
  status,
  orderBy,
  searchQuery,
  dateFilters,
  id,
  userId,
}: UseModelsOptions) => {
  return useQuery({
    ...getModelsQueryOptions({
      limit,
      offset,
      orderBy,
      status,
      searchQuery,
      dateFilters,
      id,
      userId,
    }),
  });
};

export const useModelDetails = (
  id: string,
  enabled: boolean = true,
  refetchInterval: boolean | number = false
) => {
  return useQuery({
    ...getModelDetailsQueryOptions(id, refetchInterval),
    retry: (_, error) => {
      // When a model is not found, don't retry.
      //@ts-expect-error bad type definition
      return error.response?.status !== 404;
    },
    enabled: enabled,
  });
};

export const useModelsMapData = () => {
  return useQuery({
    ...getModelsMapDataQueryOptions(),
  });
};

export const useModelsListFilters = (
  status: number | undefined,
  userId?: number
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultQueries = {
    [MODEL_LIST_FILTER_QUERY_PARAMS.offset]: 0,
    [MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery) || "",
    [MODEL_LIST_FILTER_QUERY_PARAMS.ordering]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.ordering) ||
      (ORDERING_FIELDS[1].apiValue as string),
    [MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive) || false,
    [MODEL_LIST_FILTER_QUERY_PARAMS.startDate]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.startDate) || "",
    [MODEL_LIST_FILTER_QUERY_PARAMS.endDate]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.endDate) || "",
    [MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter) ||
      MODELS_LIST_DATE_FILTERS[0].searchParams,
    [MODEL_LIST_FILTER_QUERY_PARAMS.layout]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.layout) ||
      LayoutView.GRID,
    [MODEL_LIST_FILTER_QUERY_PARAMS.id]:
      searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.id) || "",
    // Status will be undefined for 'all' status filter in users models, so exclude it from the api call.
    ...(status !== undefined && {
      [MODEL_LIST_FILTER_QUERY_PARAMS.status]:
        searchParams.get(MODEL_LIST_FILTER_QUERY_PARAMS.status) || status,
    }),
  };
  const [query, setQuery] = useState<TQueryParams>(defaultQueries);

  const debouncedSearchText = useDebounce(
    query[MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery] as string,
    300
  );

  const { data, isPending, isPlaceholderData, isError } = useModels({
    searchQuery: debouncedSearchText,
    limit: PAGE_LIMIT,
    offset: query[MODEL_LIST_FILTER_QUERY_PARAMS.offset] as number,
    orderBy: query[MODEL_LIST_FILTER_QUERY_PARAMS.ordering] as string,
    id: query[MODEL_LIST_FILTER_QUERY_PARAMS.id] as number,
    dateFilters: buildDateFilterQueryString(
      MODELS_LIST_DATE_FILTERS.find(
        (filter: { searchParams: string | number | boolean | undefined }) =>
          filter.searchParams ===
          query[MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter]
      ),
      query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] as string,
      query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate] as string
    ),
    userId: userId,
    status: query[MODEL_LIST_FILTER_QUERY_PARAMS.status] as number,
  });

  const updateQuery = useCallback(
    (newParams: TQueryParams) => {
      setQuery((prevQuery) => ({
        ...prevQuery,
        ...newParams,
      }));
      const updatedParams = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          updatedParams.set(key, String(value));
        } else {
          updatedParams.delete(key);
        }
      });

      setSearchParams(updatedParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  //reset offset back to 0 when searching or when ID filtering is applied from the map.
  useEffect(() => {
    if (
      (query[MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery] !== "" ||
        query[MODEL_LIST_FILTER_QUERY_PARAMS.id] !== "") &&
      (query[MODEL_LIST_FILTER_QUERY_PARAMS.offset] as number) > 0
    ) {
      updateQuery({ [MODEL_LIST_FILTER_QUERY_PARAMS.offset]: 0 });
    }
  }, [query]);

  useEffect(() => {
    const newQuery = {
      [MODEL_LIST_FILTER_QUERY_PARAMS.offset]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.offset],
      [MODEL_LIST_FILTER_QUERY_PARAMS.ordering]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.ordering],
      [MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive],
      [MODEL_LIST_FILTER_QUERY_PARAMS.startDate]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.startDate],
      [MODEL_LIST_FILTER_QUERY_PARAMS.endDate]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.endDate],
      [MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter],
      [MODEL_LIST_FILTER_QUERY_PARAMS.layout]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.layout],
      [MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery],
      [MODEL_LIST_FILTER_QUERY_PARAMS.id]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.id],
      [MODEL_LIST_FILTER_QUERY_PARAMS.status]:
        defaultQueries[MODEL_LIST_FILTER_QUERY_PARAMS.status],
    };
    setQuery(newQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapViewIsActive = query[MODEL_LIST_FILTER_QUERY_PARAMS.mapIsActive];

  const clearAllFilters = useCallback(() => {
    const resetParams = new URLSearchParams();
    setSearchParams(resetParams);
    setQuery((prev) => ({
      // Preserve existing query params
      ...prev,
      // Clear only the filter fields
      [MODEL_LIST_FILTER_QUERY_PARAMS.searchQuery]: "",
      [MODEL_LIST_FILTER_QUERY_PARAMS.startDate]: "",
      [MODEL_LIST_FILTER_QUERY_PARAMS.endDate]: "",
      [MODEL_LIST_FILTER_QUERY_PARAMS.id]: "",
    }));
  }, [setSearchParams]);

  return {
    query,
    data,
    isPending,
    isPlaceholderData,
    isError,
    updateQuery,
    mapViewIsActive,
    clearAllFilters,
  };
};
