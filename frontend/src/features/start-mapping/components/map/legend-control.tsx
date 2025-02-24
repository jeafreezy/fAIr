import { Map } from "maplibre-gl";

import { useCallback, useState } from "react";

import { LegendBookIcon } from "@/components/ui/icons";
import { LEGEND_NAME_MAPPING, MAP_STYLES_PREFIX } from "@/config";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import useScreenSize from "@/hooks/use-screen-size";

const FillLegendStyle = ({
  fillColor,
  fillOpacity,
}: {
  fillColor: string;
  fillOpacity: number;
}) => {
  return (
    <span
      className="block h-3 w-4 rounded-[2px] border"
      style={{
        backgroundColor: `rgba(${parseInt(fillColor.slice(1, 3), 16)}, ${parseInt(fillColor.slice(3, 5), 16)}, ${parseInt(fillColor.slice(5, 7), 16)}, ${fillOpacity})`,
        borderColor: fillColor,
      }}
    ></span>
  );
};

export const Legend = ({ map }: { map: Map | null }) => {
  const [expandLegend, setExpandLegend] = useState<boolean>(true);

  const activeFillLayers =
    map
      ?.getStyle()
      .layers?.filter(
        (layer) =>
          layer.id.includes(MAP_STYLES_PREFIX) &&
          layer.layout?.visibility === "visible" &&
          layer.type === "fill"
      )
      .reverse() || [];

  const handleToggleExpand = useCallback(() => {
    setExpandLegend((prev) => !prev);
  }, []);

  const { isSmallViewport } = useScreenSize();

  return (
    <button
      disabled={!activeFillLayers}
      className={`flex items-center gap-x-4 rounded-xl bg-white p-2.5  ${isSmallViewport ? "border border-gray-border" : "absolute bottom-3 left-3 flex-col gap-y-4 rounded-[4px] border border-gray-border"}`}
      onClick={handleToggleExpand}
    >
      {!expandLegend && isSmallViewport && (
        <LegendBookIcon className="icon-lg" />
      )}
      {!isSmallViewport && (
        <p className="flex w-full items-center justify-between gap-x-10 text-body-2base font-semibold text-dark">
          {START_MAPPING_PAGE_CONTENT.map.controls.legendControl.title}
          <LegendBookIcon className="icon" />
        </p>
      )}
      {expandLegend && activeFillLayers ? (
        <div
          className={`flex  w-full ${isSmallViewport ? "flex-row gap-x-2" : "flex-col"} gap-y-3`}
        >
          {activeFillLayers?.map((layer, id) => (
            <p
              className="flex w-full items-center gap-x-2 text-nowrap text-body-4 text-dark md:text-body-3"
              key={id}
            >
              {layer.type === "fill" ? (
                <FillLegendStyle
                  fillColor={layer.paint?.["fill-color"] as string}
                  fillOpacity={layer.paint?.["fill-opacity"] as number}
                />
              ) : null}
              {LEGEND_NAME_MAPPING[layer.id]}
            </p>
          ))}
        </div>
      ) : null}
      {expandLegend && isSmallViewport ? (
        <LegendBookIcon className="icon-lg" />
      ) : null}
    </button>
  );
};
