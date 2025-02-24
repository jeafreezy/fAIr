import { LngLatBoundsLike, Map } from "maplibre-gl";

import { useCallback } from "react";

import { ArrowMoveIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { MAP_CONTENT } from "@/constants";
import useScreenSize from "@/hooks/use-screen-size";

export const FitToBounds = ({
  map,
  bounds,
}: {
  map: Map | null;
  bounds: LngLatBoundsLike | undefined;
}) => {
  const { isSmallViewport } = useScreenSize();

  const fitToBounds = useCallback(() => {
    if (!map || !bounds) return;
    map?.fitBounds(bounds);
  }, [map, bounds]);

  return (
    <ToolTip content={MAP_CONTENT.controls.fitToBounds.tooltip}>
      <button
        className={`bg-white  ${isSmallViewport ? "rounded-xl border border-gray-border p-2.5 md:border-0" : "p-1.5"}`}
        onClick={fitToBounds}
      >
        <ArrowMoveIcon className="icon-lg" />
      </button>
    </ToolTip>
  );
};
