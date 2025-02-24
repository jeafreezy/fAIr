import ModelPropertiesSkeleton from "./model-properties-skeleton";

export const SectionTitleSkeleton = () => {
  return <div className="h-10 max-w-sm animate-pulse bg-light-gray"></div>;
};
const ModelInfoSkeleton = () => {
  return (
    <div className="my-12 flex flex-col gap-y-20">
      <section className="flex animate-pulse flex-col gap-y-8">
        <div className="flex flex-col gap-y-4">
          <div className="inline-flex flex-col gap-y-2">
            <div className="animated-pulse h-4 bg-light-gray md:w-32 " />
            <div className="flex items-center justify-between">
              <div className="animated-pulse h-8 w-64 bg-light-gray " />
              <div className="animated-pulse h-10 bg-light-gray md:w-36 " />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-2 md:self-end">
          <div className="animated-pulse h-4 w-40 bg-light-gray " />
        </div>

        <div className="animated-pulse h-px w-full bg-light-gray" />

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="flex flex-col gap-y-10">
            <div className="animated-pulse h-4 w-32 bg-light-gray " />
            <div className="animated-pulse h-4 w-48 bg-light-gray " />
            <div className="animated-pulse h-4 w-48 bg-light-gray " />
          </div>
          <div className="flex flex-col justify-between gap-y-4">
            <div className="animated-pulse h-4 w-48 bg-light-gray " />
            <div className="animated-pulse h-10 w-44 bg-light-gray " />
          </div>
          <div className="flex flex-col justify-between gap-y-4 md:items-end">
            <div className="animated-pulse h-4 w-32 bg-light-gray " />
            <div className="animated-pulse h-10 w-36 bg-light-gray " />
          </div>
        </div>
      </section>
    </div>
  );
};

const TrainingHistorySkeleton = () => {
  return (
    <div className="flex h-[400px] w-full flex-col gap-y-10">
      <div className="flex w-full items-center justify-between">
        <div className="h-10 w-full max-w-sm animate-pulse bg-light-gray"></div>
        <div className="h-10 w-full max-w-sm animate-pulse bg-light-gray"></div>
      </div>
      <div className="size-full animate-pulse bg-light-gray"></div>
    </div>
  );
};

const ModelDetailsSkeleton = () => {
  return (
    <div className="my-10 flex flex-col gap-y-20">
      <ModelInfoSkeleton />
      <ModelPropertiesSkeleton />
      <TrainingHistorySkeleton />
    </div>
  );
};

export default ModelDetailsSkeleton;
