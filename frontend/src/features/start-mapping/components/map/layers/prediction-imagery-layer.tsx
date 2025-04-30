import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  PREDICTION_IMAGERY_SOURCE,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  TILE_BOUNDARY_LAYER_ID,
} from "@/config";
import { TileServiceType } from "@/enums";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useDynamicMapLayer } from "@/hooks/use-map-layer";
import { TileJSON } from "@/types";
import {
  extractTileJSONURL,
  OPENAERIALMAP_TILESERVER_URL_REGEX_PATTERN,
} from "@/utils";
import {
  Map,
  RasterLayerSpecification,
  RasterSourceSpecification,
} from "maplibre-gl";
import { useEffect, useMemo } from "react";

export const PredictionImageryLayer = ({
  map,
  predictionImageryURL,
  predictionImagerySource,
  tileServiceType,
  layerId,
  tileJSONMetadata,
}: {
  map: Map | null;
  predictionImageryURL: string;
  predictionImagerySource: PredictionImagerySource;
  tileServiceType: TileServiceType;
  layerId: string;
  tileJSONMetadata: TileJSON | null;
}) => {
  /**
   * Check if the tile server URL is an OpenAerialMap tile server URL.
   */
  const { sourceURL, isOpenAerialMap } = useMemo(() => {
    const openAerial =
      OPENAERIALMAP_TILESERVER_URL_REGEX_PATTERN.test(predictionImageryURL);
    return {
      isOpenAerialMap: openAerial,
      sourceURL: openAerial
        ? extractTileJSONURL(predictionImageryURL)
        : predictionImageryURL,
    };
  }, [predictionImageryURL]);

  /**
   * Fetch the tileJSON metadata and fit the map to the bounds of the tileJSON.
   */
  useEffect(() => {
    if (!map || !tileJSONMetadata) return;
    if (!isOpenAerialMap && tileServiceType !== TileServiceType.TILEJSON)
      return;
    map.fitBounds(tileJSONMetadata.bounds);
  }, [
    map,
    predictionImagerySource,
    tileJSONMetadata,
    isOpenAerialMap,
    tileServiceType,
  ]);

  const sourceId = `${PREDICTION_IMAGERY_SOURCE}-${predictionImagerySource}`;

  const sourceSpec: RasterSourceSpecification = useMemo(
    () =>
      isOpenAerialMap || tileServiceType === TileServiceType.TILEJSON
        ? {
            type: "raster",
            url: sourceURL,
            tileSize: 256,
          }
        : {
            type: "raster",
            tiles: [sourceURL],
            tileSize: 256,
          },
    [sourceURL],
  );

  const layerSpec: RasterLayerSpecification = useMemo(
    () => ({
      id: layerId,
      type: "raster",
      source: sourceId,
      layout: {
        visibility: "visible",
      },
    }),
    [layerId, sourceId],
  );

  /**
   * Use the dynamic map layer hook to add the prediction imagery layer to the map.
   */
  useDynamicMapLayer(
    map,
    sourceId,
    layerId,
    sourceSpec,
    layerSpec,
    [
      predictionImageryURL,
      predictionImagerySource,
      sourceURL,
      tileServiceType,
      isOpenAerialMap,
    ],
    predictionImageryURL !== undefined &&
      predictionImageryURL?.length > 0 &&
      predictionImagerySource !== PredictionImagerySource.ModelDefault,
    /**
     * Place the prediction imagery layer below the prediction layers and also tile boundary layer.
     */
    [
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      TILE_BOUNDARY_LAYER_ID,
    ],
  );
  return null;
};
