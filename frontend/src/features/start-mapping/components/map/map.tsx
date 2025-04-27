import useScreenSize from "@/hooks/use-screen-size";
import { ControlsPosition } from "@/enums";
import { extractTileJSONURL, showErrorToast } from "@/utils";
import { LngLatBoundsLike, Map } from "maplibre-gl";
import {
  Legend,
  PredictedFeatureActionPopup,
} from "@/features/start-mapping/components";
import { MapComponent, MapCursorToolTip } from "@/components/map";
import { TOAST_NOTIFICATIONS } from "@/constants";
import { memo, RefObject, useEffect, useMemo } from "react";

import { TileJSON, TTrainingDataset } from "@/types";
import {
  MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION,
  MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION,
} from "@/config";
import bbox from "@turf/bbox";
import {
  AcceptedPredictionsLayer,
  RejectedPredictionsLayer,
  AllPredictionsLayer,
  PredictionImageryLayer,
} from "@/features/start-mapping/components/map/layers";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useMapStore } from "@/store/map-store";
import { useModelPredictionStore } from "@/store/model-prediction-store";

export const StartMappingMapComponent = ({
  trainingDataset,
  oamTileJSONIsError,
  oamTileJSON,
  map,
  mapContainerRef,
  layers,
  tmsBounds,
  trainingId,
  modelInfoRequestIsPending,
  predictionImagerySource,
  predictionImageryURL,
}: {
  trainingId: number;
  trainingDataset?: TTrainingDataset;
  oamTileJSONIsError: boolean;
  oamTileJSON: TileJSON;
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement>;
  layers: {
    value: string;
    subLayers: string[];
  }[];
  tmsBounds: LngLatBoundsLike;
  modelInfoRequestIsPending: boolean;
  predictionImagerySource: PredictionImagerySource;
  predictionImageryURL: string | undefined;
}) => {
  const tileJSONURL = extractTileJSONURL(trainingDataset?.source_imagery ?? "");
  const { isSmallViewport } = useScreenSize();
  const currentZoom = useMapStore.getState().zoom;
  useEffect(() => {
    if (!oamTileJSONIsError) return;
    showErrorToast(undefined, TOAST_NOTIFICATIONS.trainingDataset.error);
  }, [oamTileJSONIsError]);

  const { modelPredictions } = useModelPredictionStore();

  const modelPredictionsExist = useMemo(() => {
    return (
      modelPredictions.accepted.length > 0 ||
      modelPredictions.rejected.length > 0 ||
      modelPredictions.all.length > 0
    );
  }, [modelPredictions]);

  useEffect(() => {
    if (
      !map ||
      !tmsBounds ||
      oamTileJSONIsError ||
      modelInfoRequestIsPending ||
      /**
       * Zoom to the bounds of the tileJSON if the user has not selected the default model imagery.
       */
      predictionImagerySource !== PredictionImagerySource.ModelDefault
    )
      return;

    // if there are predictions that the user hasn't interacted with, zoom to them.
    if (modelPredictions.all.length > 0) {
      // get the bbox of the features with turf.
      map.fitBounds(
        bbox({
          type: "FeatureCollection",
          features: modelPredictions.all,
        }) as LngLatBoundsLike,
      );
    } else {
      map.fitBounds(tmsBounds);
    }
  }, [
    map,
    tmsBounds,
    oamTileJSONIsError,
    oamTileJSON,
    modelInfoRequestIsPending,
    predictionImagerySource,
  ]);

  const shouldShowTooltip =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION;

  const memoizedToolTip = useMemo(() => {
    if (!map) return null;

    return (
      <MapCursorToolTip
        color="bg-primary"
        map={map}
        showTooltip={shouldShowTooltip}
        minZoom={MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION}
      >
        {MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION}
      </MapCursorToolTip>
    );
  }, [map, currentZoom]);

  return (
    <MapComponent
      controlsPosition={ControlsPosition.TOP_LEFT}
      showTileBoundaries
      fitToBounds={!isSmallViewport}
      bounds={tmsBounds}
      mapContainerRef={mapContainerRef}
      map={map}
      zoomControls={!isSmallViewport}
      layerControl={!isSmallViewport}
      layerControlLayers={layers}
      basemaps
      showCurrentZoom={!isSmallViewport}
      openAerialMap={!modelInfoRequestIsPending}
      oamTileJSONURL={tileJSONURL}
    >
      {map && (
        <PredictionImageryLayer
          map={map}
          predictionImagerySource={predictionImagerySource}
          predictionImageryURL={predictionImageryURL}
        />
      )}
      {map && <PredictedFeatureActionPopup trainingId={trainingId} map={map} />}

      {!modelInfoRequestIsPending && map && <PredictionLayers map={map} />}
      {memoizedToolTip}
      {map && modelPredictionsExist && !isSmallViewport && <Legend map={map} />}
    </MapComponent>
  );
};

const PredictionLayers = memo(({ map }: { map: Map | null }) => {
  const { modelPredictions } = useModelPredictionStore();

  return (
    <>
      <AcceptedPredictionsLayer
        map={map}
        features={modelPredictions.accepted}
      />
      <RejectedPredictionsLayer
        map={map}
        features={modelPredictions.rejected}
      />
      <AllPredictionsLayer map={map} features={modelPredictions.all} />
    </>
  );
});
