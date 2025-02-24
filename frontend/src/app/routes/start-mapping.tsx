import { LngLatBoundsLike } from "maplibre-gl";

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { UserProfile } from "@/components/layout";
import { FitToBounds, LayerControl, ZoomLevel } from "@/components/map";
import { Head } from "@/components/seo";
import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION,
  PREDICTION_API_FILE_EXTENSIONS,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
} from "@/config";
import {
  APPLICATION_ROUTES,
  MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS,
  START_MAPPING_PAGE_CONTENT,
  TOAST_NOTIFICATIONS,
} from "@/constants";
import { BASE_MODELS } from "@/enums";
import { useGetTMSTileJSON } from "@/features/model-creation/hooks/use-tms-tilejson";
import { useGetTrainingDataset } from "@/features/models/hooks/use-dataset";
import { useModelDetails } from "@/features/models/hooks/use-models";
import { ModelDetailsPopUp } from "@/features/start-mapping/components";
import {
  BrandLogoWithDropDown,
  Legend,
  StartMappingHeader,
  StartMappingMapComponent,
  StartMappingMobileDrawer,
} from "@/features/start-mapping/components";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { useMapInstance } from "@/hooks/use-map-instance";
import useScreenSize from "@/hooks/use-screen-size";
import {
  BBOX,
  Feature,
  TModelPredictions,
  TModelPredictionsConfig,
  TileJSON,
} from "@/types";
import {
  extractTileJSONURL,
  geoJSONDowloader,
  openInJOSM,
  showSuccessToast,
} from "@/utils";

export type TDownloadOptions = {
  name: string;
  value: string;
  onClick: () => void;
  showOnMobile: boolean;
}[];

export type TQueryParams = { [x: string]: string | number | boolean };

export const StartMappingPage = () => {
  const { modelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { map, mapContainerRef, currentZoom } = useMapInstance();
  const { isSmallViewport } = useScreenSize();
  const navigate = useNavigate();
  const bounds = map?.getBounds();
  const [showModelDetailsPopup, setShowModelDetailsPopup] =
    useState<boolean>(false);
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();

  const { isError, isPending, data, error } = useModelDetails(
    modelId as string,
    !!modelId
  );

  const {
    data: trainingDataset,
    isPending: trainingDatasetIsPending,
    isError: trainingDatasetIsError,
  } = useGetTrainingDataset(data?.dataset as number, !isPending);

  const tileJSONURL = extractTileJSONURL(trainingDataset?.source_imagery ?? "");

  const {
    data: oamTileJSON,
    isError: oamTileJSONIsError,
    error: oamTileJSONError,
  } = useGetTMSTileJSON(tileJSONURL);

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
      [MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.useJOSMQ]:
        searchParams.get(MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.useJOSMQ) ||
        true,
      [MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.confidenceLevel]:
        searchParams.get(
          MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.confidenceLevel
        ) || 90,
      [MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.tolerance]:
        searchParams.get(MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.tolerance) ||
        1.0,
      [MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.area]:
        searchParams.get(MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.area) || 4,
    };
  });

  const [modelPredictions, setModelPredictions] = useState<TModelPredictions>({
    all: [],
    accepted: [],
    rejected: [],
  });

  const modelPredictionsExist =
    modelPredictions.accepted.length > 0 ||
    modelPredictions.rejected.length > 0 ||
    modelPredictions.all.length > 0;

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
    [searchParams, setSearchParams]
  );

  const trainingConfig: TModelPredictionsConfig = {
    tolerance: query[
      MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.tolerance
    ] as number,
    area_threshold: query[
      MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.area
    ] as number,
    use_josm_q: query[
      MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.useJOSMQ
    ] as boolean,
    confidence: query[
      MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.confidenceLevel
    ] as number,
    checkpoint: `/mnt/efsmount/data/trainings/dataset_${data?.dataset}/output/training_${data?.published_training}/checkpoint${PREDICTION_API_FILE_EXTENSIONS[data?.base_model as BASE_MODELS]}`,
    max_angle_change: 15,
    model_id: modelId as string,
    skew_tolerance: 15,
    source: trainingDataset?.source_imagery as string,
    zoom_level: currentZoom,
    bbox: [
      bounds?.getWest(),
      bounds?.getSouth(),
      bounds?.getEast(),
      bounds?.getNorth(),
    ] as BBOX,
  };

  const disablePrediction =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION;

  const popupAnchorId = "model-details";

  const mapLayers = [
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
  ];

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
      `all_predictions_${data.dataset}`
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, data]);

  const handleAcceptedFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      { type: "FeatureCollection", features: modelPredictions.accepted },
      `accepted_predictions_${data.dataset}`
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, data]);

  const handleFeaturesDownloadToJOSM = useCallback(
    (features: Feature[]) => {
      if (!map || !trainingDataset?.name || !trainingDataset?.source_imagery)
        return;
      openInJOSM(
        trainingDataset.name,
        trainingDataset.source_imagery,
        features,
        true
      );
    },
    [map, oamTileJSON, trainingDataset]
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
        isSmallViewport ? "All" : "Download all"
      ),
      value: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all"
      ),
      onClick: handleAllFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
        isSmallViewport ? "Accepted" : "Download accepted"
      ),
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
          isSmallViewport ? "Accepted" : "Download accepted"
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

  const handleModelDetailsPopup = useCallback(() => {
    setShowModelDetailsPopup((prev) => !prev);
  }, [setShowModelDetailsPopup]);

  const clearPredictions = useCallback(() => {
    setModelPredictions({
      accepted: [],
      rejected: [],
      all: [],
    });
  }, [setModelPredictions]);

  return (
    <>
      <Head title={START_MAPPING_PAGE_CONTENT.pageTitle(data?.name)} />
      {/* Mobile dialog */}
      <div className="fullscreen flex h-screen flex-col">
        <StartMappingMobileDrawer
          isOpen={isSmallViewport}
          disablePrediction={disablePrediction}
          trainingConfig={trainingConfig}
          setModelPredictions={setModelPredictions}
          modelPredictions={modelPredictions}
          map={map}
          handleModelDetailsPopup={handleModelDetailsPopup}
          downloadOptions={downloadOptions}
          query={query}
          updateQuery={updateQuery}
          modelDetailsPopupIsActive={showModelDetailsPopup}
          clearPredictions={clearPredictions}
        />
        <div className="sticky top-0 z-10 hidden bg-white px-4 py-1 md:block xl:px-large">
          {/* Model Details Popup */}
          {data && (
            <ModelDetailsPopUp
              showPopup={showModelDetailsPopup}
              handlePopup={handleModelDetailsPopup}
              closeMobileDrawer={() => setShowModelDetailsPopup(false)}
              anchor={popupAnchorId}
              model={data}
              trainingDataset={trainingDataset}
              trainingDatasetIsPending={trainingDatasetIsPending}
              trainingDatasetIsError={trainingDatasetIsError}
            />
          )}
          {/* Web Header */}
          <StartMappingHeader
            data={data}
            trainingDatasetIsPending={trainingDatasetIsPending}
            modelPredictionsExist={modelPredictionsExist}
            trainingDatasetIsError={trainingDatasetIsError}
            modelPredictions={modelPredictions}
            query={query}
            updateQuery={updateQuery}
            trainingConfig={trainingConfig}
            setModelPredictions={setModelPredictions}
            map={map}
            disablePrediction={disablePrediction}
            popupAnchorId={popupAnchorId}
            modelDetailsPopupIsActive={showModelDetailsPopup}
            handleModelDetailsPopup={handleModelDetailsPopup}
            downloadOptions={downloadOptions}
            clearPredictions={clearPredictions}
          />
        </div>
        <div className="map-elements-z-index relative col-span-12 h-[70vh] grow md:h-full md:border-8 md:border-off-white">
          {/* Mobile Header and Map Controls */}
          <div className="md:hidden">
            <div className="absolute right-4 top-4  z-10">
              <UserProfile hideFullName />
            </div>
            <div className="absolute left-4 top-1  z-10">
              <BrandLogoWithDropDown
                onClose={onDropdownHide}
                onShow={onDropdownShow}
                isOpened={dropdownIsOpened}
              />
            </div>
            <div className="absolute right-4 top-[10vh] z-[2] flex flex-col items-end gap-y-4">
              <ZoomLevel currentZoom={currentZoom} />
              <LayerControl
                layers={mapLayers}
                map={map}
                openAerialMap
                basemaps
              />
            </div>
            <div className="absolute bottom-[30vh] right-4 z-[1] flex flex-col items-end gap-y-4">
              <FitToBounds bounds={oamTileJSON?.bounds} map={map} />
              <div>{map && modelPredictionsExist && <Legend map={map} />}</div>
            </div>
          </div>
          {/* Map Component */}
          <StartMappingMapComponent
            trainingDataset={trainingDataset}
            modelPredictions={modelPredictions}
            setModelPredictions={setModelPredictions}
            oamTileJSONIsError={oamTileJSONIsError}
            oamTileJSON={oamTileJSON as TileJSON}
            oamTileJSONError={oamTileJSONError}
            modelPredictionsExist={modelPredictionsExist}
            mapContainerRef={mapContainerRef}
            map={map}
            currentZoom={currentZoom}
            layers={mapLayers}
            tmsBounds={oamTileJSON?.bounds as LngLatBoundsLike}
            trainingId={data?.published_training}
          />
        </div>
      </div>
    </>
  );
};
