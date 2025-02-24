import { Map } from "maplibre-gl";

import { useCallback } from "react";

import { GeolocationIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { TOAST_NOTIFICATIONS } from "@/constants";
import { ToolTipPlacement } from "@/enums";
import { showErrorToast, showWarningToast } from "@/utils";

export const GeolocationControl = ({ map }: { map: Map | null }) => {
  const handleGeolocationClick = useCallback(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            essential: true,
          });
        },
        (error) => {
          showErrorToast(`Error getting location: ${error.message}.`);
        }
      );
    } else {
      showWarningToast(TOAST_NOTIFICATIONS.geolocationNotSupported);
    }
  }, [map]);

  if (!map) return null;

  return (
    <ToolTip content="Geolocate" placement={ToolTipPlacement.RIGHT}>
      <button
        className="flex items-center justify-center bg-white p-2"
        onClick={handleGeolocationClick}
      >
        <GeolocationIcon className="map-icon p-0" />
      </button>
    </ToolTip>
  );
};
