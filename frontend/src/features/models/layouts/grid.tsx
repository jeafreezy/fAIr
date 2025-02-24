import ModelCard from "@/features/models/components/model-card";
import { TModel } from "@/types";

type ModelListProps = {
  models?: TModel[];
  isPending: boolean;
  isError: boolean;
};

const ModelListSkeleton = () => {
  return (
    <>
      {new Array(15).fill(1).map((_, id) => (
        <div
          className="col-span-1 flex min-h-[300px] max-w-[299px] flex-col gap-[30px]"
          key={`model-skeleton-grid-layout-${id}`}
        >
          <div className="flex flex-col gap-y-[13px]">
            <div className="h-[208px] max-w-[299px] animate-pulse bg-light-gray"></div>
            <div className="flex items-center justify-between">
              <div className="h-[16.91px] w-[168px] animate-pulse bg-light-gray"></div>
              <div className="h-[16.91px] w-[22.54px] animate-pulse bg-light-gray"></div>
            </div>
            <div className="h-[16.91px] max-w-[67.79px] animate-pulse bg-light-gray"></div>
          </div>
          <div className="h-[69.51px] max-w-[269px] animate-pulse bg-light-gray"></div>
          <div className="flex flex-col gap-y-[13px]">
            <div className="h-[14.94px] max-w-[116.79px] animate-pulse bg-light-gray"></div>
            <div className="h-[14.94px] max-w-[168.79px] animate-pulse bg-light-gray"></div>
          </div>
        </div>
      ))}
    </>
  );
};

const ModelListGridLayout: React.FC<ModelListProps> = ({
  models,
  isPending,
  isError,
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-10">
      {isPending || isError ? (
        <ModelListSkeleton />
      ) : (
        models?.map((model, id) => (
          <ModelCard key={`model-${id}`} model={model} />
        ))
      )}
    </div>
  );
};

export default ModelListGridLayout;
