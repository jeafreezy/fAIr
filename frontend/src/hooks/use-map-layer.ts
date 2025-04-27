import { addLayers, addSources } from "@/utils/geo/map-utils";
import { LayerSpecification, Map, SourceSpecification } from "maplibre-gl";
import { useCallback, useEffect } from "react";

export const useMapLayers = (
  layersSpec: LayerSpecification[],
  sourcesSpec: { id: string; spec: SourceSpecification }[],
  map: Map | null,
) => {
  const addSourcesAndLayers = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;
    addSources(map, sourcesSpec);
    addLayers(map, layersSpec);
  }, [map, sourcesSpec, layersSpec]);

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    if (!map.isStyleLoaded()) {
      map.once("styledata", addSourcesAndLayers);
    } else {
      addSourcesAndLayers();
    }
    return () => {
      map.off("styledata", addSourcesAndLayers);
    };
  }, [map, addSourcesAndLayers, layersSpec, sourcesSpec]);

  return null;
};
/**
 * Custom hook to manage dynamic map layers.
 */
export const useDynamicMapLayer = (
  map: Map | null,
  sourceId: string,
  layerId: string,
  sourceSpec: SourceSpecification | null,
  layerSpec: LayerSpecification | null,
  dependencies: any[] = [],
  enabled: boolean = true,
  belowLayerIds: string[] = [],
) => {
  useEffect(() => {
    if (!map || !sourceSpec || !layerSpec || !enabled) return;

    const addOrUpdateLayer = async () => {
      const existingSource = map.getSource(sourceId);
      if (!existingSource) {
        map.addSource(sourceId, sourceSpec);
      }

      if (!map.getLayer(layerId)) {
        belowLayerIds.forEach((id) => {
          if (map.getLayer(id)) {
            map.moveLayer(id);
          }
        });
        const insertBeforeLayerId = belowLayerIds.find((id) =>
          map.getLayer(id),
        );
        map.addLayer(layerSpec, insertBeforeLayerId || undefined);
      } else {
        map.setLayoutProperty(layerId, "visibility", "visible");
      }
    };

    addOrUpdateLayer();
    return () => {
      if (!map || !map.getStyle()) return;
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "none");
      }
    };
  }, [
    map,
    sourceId,
    layerId,
    sourceSpec,
    layerSpec,
    ...dependencies,
    belowLayerIds,
  ]);
};
