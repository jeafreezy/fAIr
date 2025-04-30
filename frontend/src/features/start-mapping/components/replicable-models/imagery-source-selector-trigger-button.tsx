import { DropDown } from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { DropdownPlacement, TileServiceType } from "@/enums";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { ImagerySourceSelector } from "@/features/start-mapping/components/replicable-models/imagery-source-selector";
import { PredictionImagerySource } from "@/enums/start-mapping";
import useScreenSize from "@/hooks/use-screen-size";

export const ImagerySourceSelectorTriggerButton = ({
  setPredictionImageryURL,
  predictionImagerySource,
  setPredictionImagerySource,
  modelDefaultImageryURL,
  openMobileDialog,
  tileServerURL,
  tileServiceType,
  tileServiceTypeValidity,
  setTileServiceTypeValidity,
  setTileserverURL,
  loading,
  setTileServiceType,
}: {
  setPredictionImageryURL: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  predictionImagerySource: PredictionImagerySource;
  setPredictionImagerySource: React.Dispatch<
    React.SetStateAction<PredictionImagerySource>
  >;
  modelDefaultImageryURL: string;
  openMobileDialog?: () => void;
  tileServerURL: string;
  tileServiceType: TileServiceType;
  tileServiceTypeValidity: {
    valid: boolean;
    message: string;
  };
  setTileServiceTypeValidity: React.Dispatch<
    React.SetStateAction<{
      valid: boolean;
      message: string;
    }>
  >;
  setTileserverURL: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setTileServiceType: React.Dispatch<React.SetStateAction<TileServiceType>>;
}) => {
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();
  const { isSmallViewport } = useScreenSize();

  return (
    <div className="flex items-center gap-x-1 w-fit">
      <p className="text-body-4 hidden lg:inline-block">Imagery:</p>
      <DropDown
        placement={DropdownPlacement.TOP_END}
        disableCheveronIcon
        disabled={isSmallViewport}
        dropdownIsOpened={dropdownIsOpened}
        onDropdownHide={onDropdownHide}
        onDropdownShow={onDropdownShow}
        distance={ELEMENT_DISTANCE_FROM_NAVBAR}
        triggerComponent={
          <ToolTip content={!isSmallViewport ? "Prediction Imagery" : ""}>
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
                className={`${isSmallViewport ? "w-fit max-w-[100px] text-body-4" : "max-w-[50px] lg:max-w-[100px] text-body-4 "} overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {predictionImagerySource}
              </button>
              <ChevronDownIcon
                className={`transition-all ${isSmallViewport ? "-rotate-90" : dropdownIsOpened ? "rotate-180" : ""} w-3 h-3`}
              />
            </div>
          </ToolTip>
        }
      >
        <ImagerySourceSelector
          setPredictionImageryURL={setPredictionImageryURL}
          predictionImagerySource={predictionImagerySource}
          setPredictionImagerySource={setPredictionImagerySource}
          modelDefaultImageryURL={modelDefaultImageryURL}
          onDropdownHide={onDropdownHide}
          tileServerURL={tileServerURL}
          tileServiceType={tileServiceType}
          tileServiceTypeValidity={tileServiceTypeValidity}
          setTileServiceTypeValidity={setTileServiceTypeValidity}
          setTileserverURL={setTileserverURL}
          loading={loading}
          setTileServiceType={setTileServiceType}
        />
      </DropDown>
    </div>
  );
};
