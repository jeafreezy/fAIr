import { Map } from "maplibre-gl";

import { useCallback } from "react";

import { ToolTipPlacement } from "@/enums";
import { cn } from "@/utils";

import { ToolTip } from "../../ui/tooltip";

const ZoomButton = ({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: string;
}) => (
  <button className={cn(`p-2 bg-white `)} onClick={onClick} disabled={disabled}>
    <span
      className={`map-icon border-2 ${disabled ? "cursor-not-allowed border-gray-border  text-gray-border" : "border-dark text-dark"} inline-flex items-center justify-center rounded-[4px] text-lg`}
    >
      {icon}
    </span>
  </button>
);

export const ZoomControls = ({
  map,
  currentZoom,
}: {
  map: Map | null;
  currentZoom: number;
}) => {
  const handleZoomIn = useCallback(() => {
    if (map && currentZoom < map.getMaxZoom()) {
      map.zoomIn();
    }
  }, [map, currentZoom]);

  const handleZoomOut = useCallback(() => {
    if (map && currentZoom > map.getMinZoom()) {
      map.zoomOut();
    }
  }, [map, currentZoom]);

  return (
    <div className="flex flex-col gap-y-px">
      <ToolTip placement={ToolTipPlacement.RIGHT} content="Zoom In">
        <ZoomButton
          onClick={handleZoomIn}
          disabled={currentZoom >= Number(map?.getMaxZoom())}
          icon="+"
        />
      </ToolTip>
      <ToolTip placement={ToolTipPlacement.RIGHT} content="Zoom Out">
        <ZoomButton
          onClick={handleZoomOut}
          disabled={currentZoom <= Number(map?.getMinZoom())}
          icon="-"
        />
      </ToolTip>
    </div>
  );
};
