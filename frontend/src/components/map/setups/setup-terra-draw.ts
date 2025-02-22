import maplibregl from "maplibre-gl";
import { HexColorStyling } from "node_modules/terra-draw/dist/common";

import {
  TerraDraw,
  TerraDrawMapLibreGLAdapter,
  TerraDrawRectangleMode,
  ValidateNotSelfIntersecting,
} from "terra-draw";

import {
  TRAINING_AREAS_AOI_FILL_COLOR,
  TRAINING_AREAS_AOI_FILL_OPACITY,
  TRAINING_AREAS_AOI_OUTLINE_COLOR,
  TRAINING_AREAS_AOI_OUTLINE_WIDTH,
} from "@/config";

export const setupTerraDraw = (map: maplibregl.Map) => {
  return new TerraDraw({
    tracked: true,
    adapter: new TerraDrawMapLibreGLAdapter({
      map,
      coordinatePrecision: 16,
    }),
    // idStrategy: {
    //   isValidId: () => true,
    //   getId: (function () {
    //     let id = 0;
    //     return function () {
    //       return ++id;
    //     };
    //   })(),
    // },
    modes: [
      // new TerraDrawSelectMode({
      //   flags: {
      //     arbitary: {
      //       feature: {},
      //     },
      //     rectangle: {
      //       feature: {
      //         draggable: true,
      //         coordinates: {
      //           resizable: "opposite",
      //         },
      //       },
      //     },
      //   },
      // }),
      new TerraDrawRectangleMode({
        validation: (feature, { updateType }) => {
          if (updateType === "finish" || updateType === "commit") {
            return ValidateNotSelfIntersecting(feature);
          }
          return true;
        },
        styles: {
          // Fill colour (a string containing a 6 digit Hex color)
          fillColor: TRAINING_AREAS_AOI_FILL_COLOR as HexColorStyling,

          // Fill opacity (0 - 1)
          fillOpacity: TRAINING_AREAS_AOI_FILL_OPACITY,

          // Outline colour (Hex color)
          outlineColor: TRAINING_AREAS_AOI_OUTLINE_COLOR as HexColorStyling,

          //Outline width (Integer)
          outlineWidth: TRAINING_AREAS_AOI_OUTLINE_WIDTH,
        },
      }),
    ],
  });
};
