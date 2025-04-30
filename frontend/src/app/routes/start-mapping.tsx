import useScreenSize from "@/hooks/use-screen-size";
import {
  APPLICATION_ROUTES,
  START_MAPPING_PAGE_CONTENT,
  TOAST_NOTIFICATIONS,
} from "@/constants";
import { FitToBounds, LayerControl, ZoomLevel } from "@/components/map";
import { Head } from "@/components/seo";
import { LngLatBoundsLike } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { useGetTMSTileJSON } from "@/features/model-creation/hooks/use-tms-tilejson";
import { useMapInstance } from "@/hooks/use-map-instance";
import { useModelDetails } from "@/features/models/hooks/use-models";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserProfile } from "@/components/layouts";
import { Feature, TileJSON } from "@/types";
import {
  BrandLogoWithDropDown,
  Legend,
  StartMappingHeader,
  StartMappingMapComponent,
  StartMappingMobileDrawer,
} from "@/features/start-mapping/components";
import {
  constructModelCheckpointPath,
  extractTileJSONURL,
  geoJSONDowloader,
  openInJOSM,
  showSuccessToast,
} from "@/utils";
import {
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
} from "@/config";

import { PredictionImagerySource } from "@/enums/start-mapping";
import { Dialog } from "@/components/ui/dialog";
import { ImagerySourceSelector } from "@/features/start-mapping/components/replicable-models/imagery-source-selector";
import { useDialog } from "@/hooks/use-dialog";
import { useModelPredictionStore } from "@/store/model-prediction-store";
import { ModelSelector } from "@/features/start-mapping/components/replicable-models/model-selector";
import { TileServiceType } from "@/enums";
import { useTileservice } from "@/hooks/use-tileservice";

export type TDownloadOptions = {
  name: string;
  value: string;
  onClick: () => void;
  showOnMobile: boolean;
}[];

export const SEARCH_PARAMS = {
  useJOSMQ: "useJOSMQ",
  confidenceLevel: "confidenceLevel",
  tolerance: "tolerance",
  area: "area",
};

export type TQueryParams = { [x: string]: string | number | boolean };

export const StartMappingPage = () => {
  const { modelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { map, mapContainerRef } = useMapInstance();
  const { isSmallViewport } = useScreenSize();

  const { modelPredictions } = useModelPredictionStore();

  const navigate = useNavigate();
  const [openMobileDrawer, setOpenMobileDrawer] =
    useState<boolean>(isSmallViewport);

  useEffect(() => {
    setOpenMobileDrawer(isSmallViewport);
  }, [isSmallViewport]);

  /**
   * State to manage the prediction imagery. This is the final URL that will be sent to the backend.
   */
  const [predictionImageryURL, setPredictionImageryURL] = useState<
    string | undefined
  >(undefined);

  const [
    customPredictionModelCheckpointPath,
    setCustomPredictionModelCheckpointPath,
  ] = useState<string>("");

  const [predictionImagerySource, setPredictionImagerySource] =
    useState<PredictionImagerySource>(PredictionImagerySource.ModelDefault);

  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();
  const { openDialog, isOpened, closeDialog } = useDialog();
  const {
    openDialog: openModelSelectionDialog,
    isOpened: isModelSelectionDialogOpened,
    closeDialog: closeModelSelectionDialog,
  } = useDialog();

  const {
    isError,
    isPending: modelInfoRequestIspending,
    data: modelInfo,
    error,
  } = useModelDetails(modelId as string, !!modelId);

  /**
   * State to manage the prediction model ID.
   */
  const [predictionModelCheckpoint, setPredictionModelCheckpoint] =
    useState<string>("");

  const [predictionModel, setPredictionModel] = useState<string>("Default");

  const tileJSONURL = useMemo(
    () =>
      modelInfo?.dataset?.source_imagery
        ? extractTileJSONURL(modelInfo?.dataset?.source_imagery)
        : undefined,
    [modelInfo?.dataset?.source_imagery],
  );

  const { data: oamTileJSON, isError: oamTileJSONIsError } = useGetTMSTileJSON(
    tileJSONURL as string,
    !!tileJSONURL,
  );

  const {
    tileServiceType,
    setTileServiceType,
    tileserverURL,
    setTileserverURL,
    tileServiceTypeValidity,
    setTileServiceTypeValidity,
    loading,
    tileJSONMetadata,
  } = useTileservice(TileServiceType.XYZ, "");

  /**
   * Set the prediction imagery to the model info's source imagery
   * when the model info is available and the prediction imagery is not set.
   * This is to ensure that the map is displayed with the correct imagery.
   */
  useEffect(() => {
    if (modelInfo) {
      setPredictionModelCheckpoint(constructModelCheckpointPath(modelInfo));
    }
  }, [modelInfo]);

  /**
   * Set the prediction imagery to the model info's source imagery
   * when the model info is available and the prediction imagery is not set.
   * This is to ensure that the map is displayed with the correct imagery.
   */
  useEffect(() => {
    if (modelInfo?.dataset?.source_imagery) {
      setPredictionImageryURL(modelInfo.dataset.source_imagery);
    }
  }, [modelInfo?.dataset?.source_imagery]);

  /**
   * Navigate to the not found page if there is an error
   * while fetching the model info.
   */
  useEffect(() => {
    if (isError) {
      navigate(APPLICATION_ROUTES.NOTFOUND, {
        state: {
          from: window.location.pathname,
          // @ts-expect-error: might not be typed
          error: error?.response?.data?.detail,
        },
      });
    }
  }, [isError, error, navigate]);

  const [query, setQuery] = useState<TQueryParams>(() => {
    return {
      [SEARCH_PARAMS.useJOSMQ]:
        searchParams.get(SEARCH_PARAMS.useJOSMQ) || true,
      [SEARCH_PARAMS.confidenceLevel]:
        searchParams.get(SEARCH_PARAMS.confidenceLevel) || 50,
      [SEARCH_PARAMS.tolerance]:
        searchParams.get(SEARCH_PARAMS.tolerance) || 0.3,
      [SEARCH_PARAMS.area]: searchParams.get(SEARCH_PARAMS.area) || 3,
    };
  });

  const modelPredictionsExist = useMemo(() => {
    return (
      modelPredictions.accepted.length > 0 ||
      modelPredictions.rejected.length > 0 ||
      modelPredictions.all.length > 0
    );
  }, [modelPredictions]);

  const updateQuery = useCallback(
    (newParams: TQueryParams) => {
      // Merge the new query values
      setQuery((prev) => ({ ...prev, ...newParams }));

      // Update the URLSearchParams
      const updatedParams = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(newParams)) {
        if (value !== undefined && value !== null) {
          updatedParams.set(key, String(value));
        } else {
          updatedParams.delete(key);
        }
      }
      setSearchParams(updatedParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const mapLayers = useMemo(
    () => [
      ...(modelPredictions.accepted.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .acceptedPredictions,
              subLayers: [
                ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
                ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
      ...(modelPredictions.rejected.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .rejectedPredictions,
              subLayers: [
                REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
                REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
      ...(modelPredictions.all.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .predictionResults,
              subLayers: [
                ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
                ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
    ],
    [modelPredictions],
  );

  const handleAllFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      {
        type: "FeatureCollection",
        features: [
          ...modelPredictions.accepted,
          ...modelPredictions.rejected,
          ...modelPredictions.all,
        ],
      },
      `all_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, modelInfo]);

  const handleAcceptedFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      { type: "FeatureCollection", features: modelPredictions.accepted },
      `accepted_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, modelInfo]);

  const handleFeaturesDownloadToJOSM = useCallback(
    (features: Feature[]) => {
      if (!map || !modelInfo?.dataset) return;
      openInJOSM(
        modelInfo.dataset.name,
        modelInfo.dataset.source_imagery,
        features,
        true,
      );
    },
    [map, modelInfo],
  );

  const handleAllFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(modelPredictions.all);
  }, [handleFeaturesDownloadToJOSM, modelPredictions.all]);

  const handleAcceptedFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(modelPredictions.accepted);
  }, [handleFeaturesDownloadToJOSM, modelPredictions.accepted]);

  const downloadOptions: TDownloadOptions = [
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      value: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      onClick: handleAllFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
        isSmallViewport ? "Accepted" : "Download accepted",
      ),
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
          isSmallViewport ? "Accepted" : "Download accepted",
        ),
      onClick: handleAcceptedFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAllFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAllFeaturesInJOSM,
      onClick: handleAllFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAcceptedFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAcceptedFeaturesInJOSM,
      onClick: handleAcceptedFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
  ];

  const handlePredictionImageryDialogOpen = useCallback(() => {
    /**
     * Close the mobile drawer when the prediction imagery dialog is opened to prevent focus trapping issues with vaul.
     */
    setOpenMobileDrawer(false);
    openDialog();
  }, [openDialog, setOpenMobileDrawer]);

  const handlePredictionImageryDialogClose = useCallback(() => {
    setOpenMobileDrawer(true);
    closeDialog();
  }, [closeDialog, setOpenMobileDrawer]);

  const handlePredictionModelDialogOpen = useCallback(() => {
    /**
     * Close the mobile drawer when the model selection dialog is opened to prevent focus trapping issues with vaul.
     */
    setOpenMobileDrawer(false);
    openModelSelectionDialog();
  }, [openModelSelectionDialog, setOpenMobileDrawer]);

  const handlePredictionModelDialogClose = useCallback(() => {
    setOpenMobileDrawer(true);
    closeModelSelectionDialog();
  }, [closeModelSelectionDialog, setOpenMobileDrawer]);

  return (
    <>
      <Head title={START_MAPPING_PAGE_CONTENT.pageTitle(modelInfo?.name)} />
      <div className="h-screen flex flex-col fullscreen">
        {/* Base model dialog */}
        <Dialog
          label="Model"
          isOpened={isModelSelectionDialogOpened}
          closeDialog={handlePredictionModelDialogClose}
        >
          {modelInfo && (
            <ModelSelector
              modelInfo={modelInfo}
              predictionModel={predictionModel}
              setPredictionModel={setPredictionModel}
              predictionModelCheckpoint={predictionModelCheckpoint}
              setPredictionModelCheckpoint={setPredictionModelCheckpoint}
              customPredictionModelCheckpointPath={
                customPredictionModelCheckpointPath
              }
              setCustomPredictionModelCheckpointPath={
                setCustomPredictionModelCheckpointPath
              }
              defaultPredictionModel={modelInfo?.name}
              isMobile
            />
          )}
        </Dialog>
        {/* Prediction Imagery Dialog */}
        <Dialog
          label="Prediction imagery"
          isOpened={isOpened}
          closeDialog={handlePredictionImageryDialogClose}
        >
          <ImagerySourceSelector
            setPredictionImageryURL={setPredictionImageryURL}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
            isMobile
            onDropdownHide={handlePredictionImageryDialogClose}
            setTileServiceType={setTileServiceType}
            setTileserverURL={setTileserverURL}
            tileServiceTypeValidity={tileServiceTypeValidity}
            setTileServiceTypeValidity={setTileServiceTypeValidity}
            loading={loading}
            tileServerURL={tileserverURL}
            tileServiceType={tileServiceType}
          />
        </Dialog>
        {/* Mobile bottom sheet */}
        <StartMappingMobileDrawer
          isOpen={openMobileDrawer}
          map={map}
          downloadOptions={downloadOptions}
          query={query}
          updateQuery={updateQuery}
          modelInfo={modelInfo}
          predictionImageryURL={predictionImageryURL}
          modelInfoRequestIsPending={modelInfoRequestIspending}
          modelInfoRequestIsError={isError}
          setPredictionImageryURL={setPredictionImageryURL}
          predictionImagerySource={predictionImagerySource}
          setPredictionImagerySource={setPredictionImagerySource}
          modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
          openMobileDialog={handlePredictionImageryDialogOpen}
          predictionModel={predictionModel}
          setPredictionModel={setPredictionModel}
          predictionModelCheckpoint={predictionModelCheckpoint}
          setPredictionModelCheckpoint={setPredictionModelCheckpoint}
          customPredictionModelCheckpointPath={
            customPredictionModelCheckpointPath
          }
          setCustomPredictionModelCheckpointPath={
            setCustomPredictionModelCheckpointPath
          }
          openModelSelectionDialog={handlePredictionModelDialogOpen}
          setTileServiceType={setTileServiceType}
          setTileserverURL={setTileserverURL}
          tileServiceTypeValidity={tileServiceTypeValidity}
          setTileServiceTypeValidity={setTileServiceTypeValidity}
          loading={loading}
          tileServerURL={tileserverURL}
          tileServiceType={tileServiceType}
        />
        <div className="sticky top-0 bg-white z-10 px-4 xl:px-large py-1 hidden md:block">
          {/* Web Header */}
          <StartMappingHeader
            modelInfo={modelInfo}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            modelPredictionsExist={modelPredictionsExist}
            modelInfoRequestIsError={isError}
            query={query}
            updateQuery={updateQuery}
            map={map}
            downloadOptions={downloadOptions}
            predictionImageryURL={predictionImageryURL}
            setPredictionImageryURL={setPredictionImageryURL}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
            predictionModel={predictionModel}
            setPredictionModel={setPredictionModel}
            predictionModelCheckpoint={predictionModelCheckpoint}
            setPredictionModelCheckpoint={setPredictionModelCheckpoint}
            customPredictionModelCheckpointPath={
              customPredictionModelCheckpointPath
            }
            setCustomPredictionModelCheckpointPath={
              setCustomPredictionModelCheckpointPath
            }
            setTileServiceType={setTileServiceType}
            setTileserverURL={setTileserverURL}
            tileServiceTypeValidity={tileServiceTypeValidity}
            setTileServiceTypeValidity={setTileServiceTypeValidity}
            loading={loading}
            tileServerURL={tileserverURL}
            tileServiceType={tileServiceType}
          />
        </div>
        <div className="col-span-12 h-[70vh] md:h-full md:border-8 md:border-off-white flex-grow relative map-elements-z-index">
          {/* Mobile Header and Map Controls */}
          <div className="md:hidden">
            <div className="absolute top-4 right-4  z-[10]">
              <UserProfile hideFullName />
            </div>
            <div className="absolute top-4 left-4  z-[10]">
              <BrandLogoWithDropDown
                onClose={onDropdownHide}
                onShow={onDropdownShow}
                isOpened={dropdownIsOpened}
              />
            </div>
            <div className="absolute top-[10vh] right-4 z-[2] flex flex-col gap-y-4 items-end">
              <ZoomLevel />
              <LayerControl
                layers={mapLayers}
                map={map}
                openAerialMap
                basemaps
                rounded
              />
            </div>
            <div className="absolute bottom-[30vh] flex flex-col gap-y-4 right-4 z-[1] items-end">
              <FitToBounds bounds={oamTileJSON?.bounds} map={map} />
              <div>{map && modelPredictionsExist && <Legend map={map} />}</div>
            </div>
          </div>
          {/* Map Component */}
          <StartMappingMapComponent
            trainingDataset={modelInfo?.dataset}
            oamTileJSONIsError={oamTileJSONIsError}
            oamTileJSON={oamTileJSON as TileJSON}
            mapContainerRef={mapContainerRef}
            map={map}
            layers={mapLayers}
            tmsBounds={oamTileJSON?.bounds as LngLatBoundsLike}
            trainingId={modelInfo?.published_training}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            predictionImagerySource={predictionImagerySource}
            predictionImageryURL={predictionImageryURL}
            predictionImageryType={tileServiceType}
            tileJSONMetadata={tileJSONMetadata}
          />
        </div>
      </div>
    </>
  );
};
