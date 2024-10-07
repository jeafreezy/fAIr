import { LayoutView } from "@/app/routes/models"


type ModelPageSkeletonProps = {
    layout: LayoutView
}
const ModelsPageSkeleton: React.FC<ModelPageSkeletonProps> = ({ layout }) => {
    return (
        <>
            {
                layout === LayoutView.GRID ? new Array(12).fill(1).map((_, id) =>
                    <div className="col-span-1 max-w-[299px] min-h-[300px] flex flex-col gap-[30px]" key={`model-skeleton-grid-layout-${id}`}>
                        <div className="flex flex-col gap-y-[13px]">
                            <div className="max-w-[299px] h-[208px] bg-light-gray animate-pulse"></div>
                            <div className="flex justify-between items-center">
                                <div className="w-[168px] h-[16.91px] bg-light-gray animate-pulse"></div>
                                <div className="w-[22.54px] h-[16.91px] bg-light-gray animate-pulse"></div>
                            </div>
                            <div className="max-w-[67.79px] h-[16.91px] bg-light-gray animate-pulse"></div>
                        </div>
                        <div className="max-w-[269px] h-[69.51px] bg-light-gray animate-pulse"></div>
                        <div className="flex flex-col gap-y-[13px]">
                            <div className="max-w-[116.79px] h-[14.94px] bg-light-gray animate-pulse"></div>
                            <div className="max-w-[168.79px] h-[14.94px] bg-light-gray animate-pulse"></div>
                        </div>
                    </div>
                ) :
                    new Array(12).fill(1).map((_, id) => <div className="col-span-1 max-w-[299px] min-h-[300px] flex flex-col gap-[30px]" key={`model-skeleton-list-layout-${id}`}>
                        <div className="flex flex-col gap-y-[13px]">
                            <div className="max-w-[299px] h-[208px] bg-light-gray animate-pulse"></div>
                            <div className="flex justify-between items-center">
                                <div className="w-[168px] h-[16.91px] bg-light-gray animate-pulse"></div>
                                <div className="w-[22.54px] h-[16.91px] bg-light-gray animate-pulse"></div>
                            </div>
                            <div className="max-w-[67.79px] h-[16.91px] bg-light-gray animate-pulse"></div>
                        </div>
                        <div className="max-w-[269px] h-[69.51px] bg-light-gray animate-pulse"></div>
                        <div className="flex flex-col gap-y-[13px]">
                            <div className="max-w-[116.79px] h-[14.94px] bg-light-gray animate-pulse"></div>
                            <div className="max-w-[168.79px] h-[14.94px] bg-light-gray animate-pulse"></div>
                        </div>
                    </div>
                    )}
        </>
    )
}


export default ModelsPageSkeleton