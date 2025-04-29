import ModelAction from "@/features/start-mapping/components/header/model-action";
import { BrandLogoWithDropDown } from "@/features/start-mapping/components/header/logo-with-dropdown";
import { ButtonWithIcon } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { DropDown } from "@/components/ui/dropdown";
import { ButtonVariant, DropdownPlacement, SHOELACE_SIZES } from "@/enums";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { Map } from "maplibre-gl";
import { ModelPredictionsTracker } from "@/features/start-mapping/components/header/model-predictions-tracker";
import { ModelSettings } from "@/features/start-mapping/components/model-settings";
import { TDownloadOptions, TQueryParams } from "@/app/routes/start-mapping";
import { TModelDetails } from "@/types";
import { ToolTip } from "@/components/ui/tooltip";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { UserProfile } from "@/components/layouts";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { ImagerySourceSelectorTriggerButton } from "@/features/start-mapping/components/replicable-models/imagery-source-selector-trigger-button";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { ModelSelectorTriggerButton } from "@/features/start-mapping/components/replicable-models/model-selector-trigger-button";
import { ModelDetailsInfoButton } from "./model-details-info-button";

const StartMappingHeader = ({
  modelInfo,
  modelPredictionsExist,
  modelInfoRequestIsPending,
  modelInfoRequestIsError,
  query,
  updateQuery,
  map,
  downloadOptions,
  predictionImageryURL,
  setPredictionImageryURL,
  predictionImagerySource,
  setPredictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
  predictionModel,
  setPredictionModel,
  predictionModelCheckpoint,
  setPredictionModelCheckpoint,
  customPredictionModelCheckpointPath,
  setCustomPredictionModelCheckpointPath,
}: {
  modelPredictionsExist: boolean;
  modelInfoRequestIsPending: boolean;
  modelInfoRequestIsError: boolean;
  modelInfo: TModelDetails;
  query: TQueryParams;
  updateQuery: (newParams: TQueryParams) => void;

  map: Map | null;
  downloadOptions: TDownloadOptions;

  predictionImageryURL: string | undefined;
  setPredictionImageryURL: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  predictionImagerySource: PredictionImagerySource;
  setPredictionImagerySource: React.Dispatch<
    React.SetStateAction<PredictionImagerySource>
  >;
  modelDefaultImageryURL: string;
  customTileServerURL: string;
  setCustomTileServerURL: React.Dispatch<React.SetStateAction<string>>;
  predictionModel: string;
  setPredictionModel: React.Dispatch<React.SetStateAction<string>>;
  predictionModelCheckpoint: string;
  setPredictionModelCheckpoint: React.Dispatch<React.SetStateAction<string>>;
  customPredictionModelCheckpointPath: string;
  setCustomPredictionModelCheckpointPath: React.Dispatch<
    React.SetStateAction<string>
  >;
}) => {
  const { onDropdownHide, onDropdownShow, dropdownIsOpened } =
    useDropdownMenu();

  const {
    onDropdownHide: onFAIRLogoDropdownHide,
    onDropdownShow: onFAIRLogoDropdownShow,
    dropdownIsOpened: FAIRLogoDropdownIsOpened,
  } = useDropdownMenu();

  return (
    <div className="h-10">
      {modelInfoRequestIsPending || modelInfoRequestIsError ? (
        <div className="h-10 animate-pulse bg-light-gray"></div>
      ) : (
        <div className="flex items-center justify-between gap-x-1">
          <div className="flex items-center gap-x-2">
            <div>
              <BrandLogoWithDropDown
                onClose={onFAIRLogoDropdownHide}
                onShow={onFAIRLogoDropdownShow}
                isOpened={FAIRLogoDropdownIsOpened}
              />
            </div>
            <div className="flex gap-x-1 items-center">
              <ModelSelectorTriggerButton
                modelInfo={modelInfo}
                setPredictionModel={setPredictionModel}
                setPredictionModelCheckpoint={setPredictionModelCheckpoint}
                predictionModel={predictionModel}
                predictionModelCheckpoint={predictionModelCheckpoint}
                customPredictionModelCheckpointPath={
                  customPredictionModelCheckpointPath
                }
                setCustomPredictionModelCheckpointPath={
                  setCustomPredictionModelCheckpointPath
                }
              />
              <div className="hidden lg:inline-block">
                <ModelDetailsInfoButton
                  modelInfo={modelInfo}
                  modelInfoRequestIsPending={modelInfoRequestIsPending}
                  modelInfoRequestIsError={modelInfoRequestIsError}
                  predictionModel={predictionModel}
                />
              </div>
            </div>
          </div>
          <div>
            <ImagerySourceSelectorTriggerButton
              setPredictionImageryURL={setPredictionImageryURL}
              predictionImagerySource={predictionImagerySource}
              setPredictionImagerySource={setPredictionImagerySource}
              modelDefaultImageryURL={modelDefaultImageryURL}
              customTileServerURL={customTileServerURL}
              setCustomTileServerURL={setCustomTileServerURL}

            />
          </div>
          <div className="flex flex-row items-center gap-x-2">
            <ModelSettings updateQuery={updateQuery} query={query} />
            <div className="flex flex-row items-center gap-y-3 gap-x-2">
              <ModelPredictionsTracker />
              <DropDown
                placement={DropdownPlacement.TOP_END}
                disableCheveronIcon
                dropdownIsOpened={dropdownIsOpened}
                onDropdownHide={onDropdownHide}
                onDropdownShow={onDropdownShow}
                menuItems={downloadOptions}
                distance={ELEMENT_DISTANCE_FROM_NAVBAR}
                triggerComponent={
                  <ToolTip
                    content={
                      !modelPredictionsExist
                        ? START_MAPPING_PAGE_CONTENT.actions.disabledModeTooltip(
                          "see actions",
                        )
                        : null
                    }
                  >
                    <ButtonWithIcon
                      uppercase={false}
                      onClick={
                        dropdownIsOpened ? onDropdownHide : onDropdownShow
                      }
                      suffixIcon={ChevronDownIcon}
                      label={START_MAPPING_PAGE_CONTENT.buttons.download.label}
                      size={SHOELACE_SIZES.SMALL}
                      textClassName="text-body-4"
                      variant={ButtonVariant.SECONDARY}
                      disabled={!modelPredictionsExist}
                      iconClassName={`transition-all ${dropdownIsOpened && "rotate-180"} w-3 h-3`}
                    />
                  </ToolTip>
                }
              />
            </div>
            <ModelAction
              map={map}
              query={query}
              modelInfo={modelInfo}
              predictionImageryURL={predictionImageryURL}
              predictionModelCheckpoint={predictionModelCheckpoint}
            />
            <UserProfile hideFullName smallerSize />
          </div>
        </div>
      )}
    </div>
  );
};

export default StartMappingHeader;
