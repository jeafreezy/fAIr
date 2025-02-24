import { useEffect } from "react";

import { Head } from "@/components/seo";
import { PAGE_LIMIT, Pagination } from "@/components/shared";
import { MODELS_CONTENT, MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { LayoutView } from "@/enums";
import {
  LayoutToggle,
  ModelMapToggle,
  ModelsMap,
} from "@/features/models/components";
import { PageHeader } from "@/features/models/components/";
import { MobileModelFiltersDialog } from "@/features/models/components/dialogs";
import {
  CategoryFilter,
  ClearFilters,
  DateRangeFilter,
  MobileFilter,
  OrderingFilter,
  SearchFilter,
} from "@/features/models/components/filters";
import ModelNotFound from "@/features/models/components/model-not-found";
import {
  useModelsListFilters,
  useModelsMapData,
} from "@/features/models/hooks/use-models";
import {
  ModelListGridLayout,
  ModelListTableLayout,
} from "@/features/models/layouts";
import { useDialog } from "@/hooks/use-dialog";
import {
  useScrollToElement,
  useScrollToTop,
} from "@/hooks/use-scroll-to-element";
import { FeatureCollection } from "@/types";

export const ModelsPage = () => {
  const { isOpened, openDialog, closeDialog } = useDialog();
  const mapViewElementId = "map-view";
  const { scrollToElement } = useScrollToElement(mapViewElementId);
  const { scrollToTop } = useScrollToTop();
  const {
    clearAllFilters,
    data,
    isError,
    isPending,
    isPlaceholderData,
    query,
    updateQuery,
    mapViewIsActive,
  } = useModelsListFilters(0);

  const {
    data: mapData,
    isPending: modelsMapDataIsPending,
    isError: modelsMapDataIsError,
  } = useModelsMapData();

  // Mapview toggle interaction
  useEffect(() => {
    if (mapViewIsActive) {
      scrollToElement();
    } else {
      scrollToTop();
    }
  }, [mapViewIsActive, scrollToElement, scrollToTop]);

  const renderContent = () => {
    if (data?.count === 0) {
      return <ModelNotFound />;
    }

    if (mapViewIsActive) {
      return (
        <div className="mt-10 grid h-screen w-full grid-cols-1 grid-rows-2 gap-x-2 gap-y-6 rounded-md md:border md:border-gray-border lg:grid-cols-2  lg:grid-rows-1 lg:gap-y-0 lg:p-2">
          <div className="w-full overflow-y-auto lg:row-start-1">
            <ModelListGridLayout
              models={data?.results}
              isPending={isPending}
              isError={isError}
            />
          </div>
          <div className="row-start-1" id={mapViewElementId}>
            {modelsMapDataIsPending || modelsMapDataIsError ? (
              <div className="size-full animate-pulse bg-light-gray"></div>
            ) : (
              <ModelsMap
                mapResults={mapData as FeatureCollection}
                updateQuery={updateQuery}
              />
            )}
          </div>
        </div>
      );
    }

    if (query[MODEL_LIST_FILTER_QUERY_PARAMS.layout] === LayoutView.LIST) {
      return (
        <div className="col-span-5">
          <ModelListTableLayout
            isPending={isPending}
            models={data?.results}
            isError={isError}
          />
        </div>
      );
    }
    return (
      <ModelListGridLayout
        isPending={isPending}
        models={data?.results}
        isError={isError}
      />
    );
  };

  return (
    <>
      <Head title="Explore Models" />
      <MobileModelFiltersDialog
        isOpened={isOpened}
        closeDialog={closeDialog}
        query={query}
        updateQuery={updateQuery}
        disabled={isPending}
      />
      <section className="my-10 min-h-screen">
        <PageHeader />
        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white py-1">
          <div className="flex flex-col gap-y-1">
            <div className=" flex w-full items-center justify-between ">
              <div className="flex w-full items-center justify-between gap-y-2 md:w-auto md:gap-x-4  md:gap-y-0">
                <SearchFilter updateQuery={updateQuery} query={query} />
                <CategoryFilter disabled={isPending} />
                {/* Mobile filters */}
                <div className="flex items-center gap-x-4 md:hidden">
                  <MobileFilter openMobileFilterModal={openDialog} />
                  <LayoutToggle
                    updateQuery={updateQuery}
                    query={query}
                    isMobile
                    disabled={Boolean(mapViewIsActive)}
                  />
                </div>
                <DateRangeFilter
                  disabled={isPending}
                  updateQuery={updateQuery}
                  query={query}
                />
                {/* Desktop */}
                <ClearFilters query={query} clearAllFilters={clearAllFilters} />
              </div>
              <div className="hidden items-center gap-x-10 md:flex">
                {/* Desktop */}
                <ModelMapToggle updateQuery={updateQuery} query={query} />
                <LayoutToggle
                  updateQuery={updateQuery}
                  query={query}
                  disabled={Boolean(mapViewIsActive)}
                />
              </div>
            </div>
            {/* Mobile */}
            <div className="self-start">
              <ClearFilters
                query={query}
                clearAllFilters={clearAllFilters}
                isMobile
              />
            </div>
          </div>
          {isPending ? (
            <div className="mt-10 h-10 w-full animate-pulse bg-light-gray text-dark"></div>
          ) : (
            <div className="top-16 my-4 flex w-full items-center justify-between">
              <div className="flex w-full items-center justify-between">
                <p className="text-body-3 font-semibold">
                  {data?.count}{" "}
                  {
                    MODELS_CONTENT.models.modelsList.sortingAndPaginationSection
                      .modelCountSuffix
                  }
                </p>
                <ModelMapToggle
                  query={query}
                  updateQuery={updateQuery}
                  isMobile
                />
              </div>
              <div className="flex items-center gap-x-9">
                <OrderingFilter
                  disabled={isPending}
                  query={query}
                  updateQuery={updateQuery}
                />
                <div className="hidden md:flex">
                  <Pagination
                    totalLength={data?.count}
                    hasNextPage={data?.hasNext}
                    hasPrevPage={data?.hasPrev}
                    disableNextPage={!data?.hasNext || isPlaceholderData}
                    disablePrevPage={!data?.hasPrev}
                    pageLimit={PAGE_LIMIT}
                    query={query}
                    updateQuery={updateQuery}
                    isPlaceholderData={isPlaceholderData}
                    centerOnMobile={false}
                    scrollToTopOnPageSwitch
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {renderContent()}
        {/* mobile pagination */}
        <div className="mt-10 flex w-full items-center justify-center md:hidden">
          <Pagination
            totalLength={data?.count}
            hasNextPage={data?.hasNext}
            hasPrevPage={data?.hasPrev}
            disableNextPage={!data?.hasNext || isPlaceholderData}
            disablePrevPage={!data?.hasPrev}
            pageLimit={PAGE_LIMIT}
            query={query}
            updateQuery={updateQuery}
            isPlaceholderData={isPlaceholderData}
            scrollToTopOnPageSwitch
          />
        </div>
      </section>
    </>
  );
};
