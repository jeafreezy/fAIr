import maplibregl, { Map } from "maplibre-gl";
import { Protocol } from "pmtiles";

import { MAP_STYLES, MAX_ZOOM_LEVEL } from "@/config";
import { BASEMAPS } from "@/enums";

export const setupMaplibreMap = (
  containerRef: React.RefObject<HTMLElement>,
  pmtiles: boolean
): Map => {
  // Check if RTL plugin is needed and set it
  if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
    maplibregl.setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true
    );
  }

  if (pmtiles) {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
  }

  const map = new maplibregl.Map({
    container: containerRef.current!,
    style: MAP_STYLES[BASEMAPS.OSM],
    center: [0, 0],
    zoom: 0.5,
    minZoom: 1,
    maxZoom: MAX_ZOOM_LEVEL,
    pitchWithRotate: false,
  });

  // Prevent the map from rotating
  map.on("rotatestart", () => {
    map.setBearing(0);
  });

  map.on("rotate", () => {
    map.setBearing(0);
  });

  map.on("rotateend", () => {
    map.setBearing(0);
  });

  return map;
};
