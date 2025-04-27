import useScreenSize from "@/hooks/use-screen-size";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { DropDown } from "@/components/ui/dropdown";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { DropdownPlacement } from "@/enums";
import { TModelDetails } from "@/types";
import { PredictionModel } from "@/enums/start-mapping";
import { ModelSelector } from "@/features/start-mapping/components/replicable-models/model-selector";

export const ModelSelectorTriggerButton = ({
  modelInfo,
  openMobileDialog,
  predictionModel,
  setPredictionModel,
  predictionModelCheckpoint,
  setPredictionModelCheckpoint,
  customPredictionModelCheckpointPath,
  setCustomPredictionModelCheckpointPath,
}: {
  modelInfo: TModelDetails;
  openMobileDialog?: () => void;
  predictionModel: string;
  setPredictionModel: React.Dispatch<React.SetStateAction<string>>;
  predictionModelCheckpoint: string;
  setPredictionModelCheckpoint: React.Dispatch<React.SetStateAction<string>>;
  customPredictionModelCheckpointPath: string;
  setCustomPredictionModelCheckpointPath: React.Dispatch<
    React.SetStateAction<string>
  >;
}) => {
  const { isSmallViewport } = useScreenSize();
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();
  console.log(dropdownIsOpened, "model-selector");
  return (
    <div className="flex items-center gap-x-1 mr-1 lg:mr-0">
      <DropDown
        placement={DropdownPlacement.BOTTOM_START}
        disableCheveronIcon
        disabled={isSmallViewport}
        dropdownIsOpened={dropdownIsOpened}
        onDropdownHide={onDropdownHide}
        onDropdownShow={onDropdownShow}
        distance={ELEMENT_DISTANCE_FROM_NAVBAR}
        triggerComponent={
          <ToolTip content={!isSmallViewport ? "Prediction Model" : ""}>
            <div
              className={`px-2 bg-off-white hover:bg-opacity-50 flex items-center p-2 gap-x-2 rounded-[6px]`}
            >
              <button
                onClick={
                  isSmallViewport
                    ? openMobileDialog
                    : dropdownIsOpened
                      ? onDropdownHide
                      : onDropdownShow
                }
                className={` ${isSmallViewport ? "w-fit max-w-[100px] text-body-4" : "max-w-[50px]  lg:max-w-[200px] text-body-4 "} overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {predictionModel === PredictionModel.DEFAULT
                  ? modelInfo?.name
                  : predictionModel}
              </button>
              <ChevronDownIcon
                className={`transition-all ${isSmallViewport ? "-rotate-90" : dropdownIsOpened ? "rotate-180" : ""} w-3 h-3`}
              />
            </div>
          </ToolTip>
        }
      >
        <ModelSelector
          predictionModel={predictionModel}
          setPredictionModel={setPredictionModel}
          predictionModelCheckpoint={predictionModelCheckpoint}
          setPredictionModelCheckpoint={setPredictionModelCheckpoint}
          isMobile={isSmallViewport}
          defaultPredictionModel={modelInfo?.name}
          customPredictionModelCheckpointPath={
            customPredictionModelCheckpointPath
          }
          setCustomPredictionModelCheckpointPath={
            setCustomPredictionModelCheckpointPath
          }
          modelInfo={modelInfo}
        />
      </DropDown>
    </div>
  );
};
