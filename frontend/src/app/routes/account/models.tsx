import { useAuth } from "@/app/providers/auth-provider";
import { Head } from "@/components/seo";
import { PAGE_LIMIT } from "@/components/shared";
import { Pagination } from "@/components/shared";
import { MODELS_CONTENT, MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { LayoutView } from "@/enums";
import { LayoutToggle, PageHeader } from "@/features/models/components";
import { MobileModelFiltersDialog } from "@/features/models/components/dialogs";
import {
  CategoryFilter,
  ClearFilters,
  DateRangeFilter,
  MobileFilter,
  OrderingFilter,
  SearchFilter,
  StatusFilter,
} from "@/features/models/components/filters";
import ModelNotFound from "@/features/models/components/model-not-found";
import { useModelsListFilters } from "@/features/models/hooks/use-models";
import {
  ModelListGridLayout,
  ModelListTableLayout,
} from "@/features/models/layouts";
import { useDialog } from "@/hooks/use-dialog";

export const UserModelsPage = () => {
  const { isOpened, openDialog, closeDialog } = useDialog();
  const { user } = useAuth();

  const {
    clearAllFilters,
    data,
    isError,
    isPending,
    isPlaceholderData,
    query,
    updateQuery,
  } = useModelsListFilters(undefined, user?.osm_id);

  const renderContent = () => {
    if (data?.count === 0) {
      return <ModelNotFound />;
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
      <MobileModelFiltersDialog
        isOpened={isOpened}
        closeDialog={closeDialog}
        query={query}
        updateQuery={updateQuery}
        disabled={isPending}
      />
      <Head title={MODELS_CONTENT.myModels.pageTitle} />
      <section className="my-10 min-h-screen">
        <PageHeader
          title={MODELS_CONTENT.myModels.pageHeader}
          description={MODELS_CONTENT.myModels.pageDescription}
        />
        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white py-2">
          <div className="flex flex-col gap-y-4">
            <div className=" flex w-full items-center justify-between ">
              <div className="flex w-full items-center justify-between gap-y-2 md:w-auto md:gap-x-4  md:gap-y-0">
                <SearchFilter updateQuery={updateQuery} query={query} />
                <CategoryFilter disabled={isPending} />
                <StatusFilter
                  disabled={isPending}
                  updateQuery={updateQuery}
                  query={query}
                />
                {/* Mobile filters */}
                <div className="flex items-center gap-x-4 md:hidden">
                  <MobileFilter openMobileFilterModal={openDialog} />
                  <LayoutToggle
                    updateQuery={updateQuery}
                    query={query}
                    isMobile
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
                <LayoutToggle updateQuery={updateQuery} query={query} />
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
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {renderContent()}

        {/* mobile pagination */}
        <div className="flex w-full items-center justify-center md:hidden">
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
          />
        </div>
      </section>
    </>
  );
};
