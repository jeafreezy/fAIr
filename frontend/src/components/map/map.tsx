import { LngLatBoundsLike, Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { RefObject } from "react";
import { TerraDraw } from "terra-draw";

import {
  DrawControl,
  FitToBounds,
  GeolocationControl,
  LayerControl,
  ZoomControls,
  ZoomLevel,
} from "@/components/map/controls";
import { Basemaps } from "@/components/map/layers/basemaps";
import { OpenAerialMap } from "@/components/map/layers/open-aerial-map";
import { TileBoundaries } from "@/components/map/layers/tile-boundaries";
import { ControlsPosition } from "@/enums";
import { DrawingModes } from "@/enums";

type MapComponentProps = {
  geolocationControl?: boolean;
  controlsPosition?: ControlsPosition;
  drawControl?: boolean;
  showCurrentZoom?: boolean;
  layerControl?: boolean;
  layerControlLayers?: {
    value: string;
    subLayers: string[];
  }[];
  showTileBoundaries?: boolean;
  children?: React.ReactNode;
  openAerialMap?: boolean;
  oamTileJSONURL?: string;
  basemaps?: boolean;
  fitToBounds?: boolean;
  bounds?: LngLatBoundsLike;
  // layers?: LayerSpecification[]
  // sources?: { id: string; spec: SourceSpecification }[],
  onMapLoad?: (map: Map) => void;
  mapContainerRef?: RefObject<HTMLDivElement> | null;
  map: Map | null;
  terraDraw?: TerraDraw | undefined;
  currentZoom?: number;
  drawingMode?: DrawingModes;
  setDrawingMode?: (newMode: DrawingModes) => void;
  zoomControls?: boolean;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  geolocationControl = false,
  controlsPosition = ControlsPosition.TOP_RIGHT,
  drawControl = false,
  showCurrentZoom = false,
  layerControl = false,
  layerControlLayers = [],
  showTileBoundaries = false,
  openAerialMap = false,
  oamTileJSONURL,
  basemaps = false,
  children,
  fitToBounds,
  bounds,
  mapContainerRef,
  map,
  terraDraw,
  currentZoom,
  drawingMode,
  zoomControls = true,
  setDrawingMode,
}) => {
  return (
    <div className={`relative size-full`} ref={mapContainerRef}>
      {map ? (
        <>
          <div
            className={`absolute top-5 ${
              controlsPosition === ControlsPosition.TOP_RIGHT
                ? "right-3"
                : "left-3"
            } map-elements-z-index flex flex-col gap-y-px`}
          >
            {currentZoom && zoomControls ? (
              <ZoomControls map={map} currentZoom={currentZoom} />
            ) : null}
            {geolocationControl && <GeolocationControl map={map} />}
            {drawControl && terraDraw && drawingMode && setDrawingMode && (
              <DrawControl
                terraDraw={terraDraw}
                drawingMode={drawingMode}
                setDrawingMode={setDrawingMode}
              />
            )}
          </div>
          {fitToBounds && (
            <div className="absolute left-3 top-28 z-[1]">
              <FitToBounds bounds={bounds} map={map} />
            </div>
          )}
          <div
            className={`map-elements-z-index absolute right-3 top-5 flex items-center gap-x-4`}
          >
            {showCurrentZoom && currentZoom ? (
              <ZoomLevel currentZoom={currentZoom} />
            ) : null}
            {layerControl && (
              <LayerControl
                basemaps={basemaps}
                layers={layerControlLayers}
                map={map}
                openAerialMap={openAerialMap}
              />
            )}
          </div>
        </>
      ) : null}
      {/* Order according to how they'll be rendered */}
      {basemaps && <Basemaps map={map} />}
      {openAerialMap && oamTileJSONURL && (
        <OpenAerialMap tileJSONURL={oamTileJSONURL} map={map} />
      )}
      {showTileBoundaries && <TileBoundaries map={map} />}
      {children}
    </div>
  );
};
