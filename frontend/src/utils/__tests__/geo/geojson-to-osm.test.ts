import { FeatureCollection } from "geojson";
import { describe, expect, it } from "vitest";

import { geojsonToOsmPolygons } from "@/utils";

describe("geojsonToOsmPolygons", () => {
  it("should convert a valid GeoJSON FeatureCollection to OSM XML", () => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [102.0, 0.0],
                [103.0, 1.0],
                [104.0, 0.0],
                [102.0, 0.0],
              ],
            ],
          },
          properties: {
            source: "test",
            building: "yes",
          },
        },
      ],
    };
    const osmXml = geojsonToOsmPolygons(geojson);
    const expectedXml = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="HOT-fAIr-(v0.1)">
  <node id="-1" lat="0" lon="102"/>
  <node id="-2" lat="1" lon="103"/>
  <node id="-3" lat="0" lon="104"/>
  <way id="-1">
    <nd ref="-1"/>
    <nd ref="-2"/>
    <nd ref="-3"/>
    <nd ref="-1"/>
    <tag k="source" v="test"/>
    <tag k="building" v="yes"/>
  </way>
</osm>`;
    expect(osmXml).toStrictEqual(expectedXml);
  });

  it("should throw an error for invalid GeoJSON FeatureCollection", () => {
    const invalidGeojson = {
      type: "InvalidType",
      features: [],
    } as unknown as FeatureCollection;

    expect(() => geojsonToOsmPolygons(invalidGeojson)).toThrow(
      "Invalid GeoJSON FeatureCollection"
    );
  });

  it("should skip unsupported geometry types", () => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [102.0, 0.5],
          },
          properties: {},
        },
      ],
    };

    const osmXml = geojsonToOsmPolygons(geojson);
    expect(osmXml).toContain(
      '<osm version="0.6" generator="HOT-fAIr-(v0.1)"/>'
    );
  });

  it("should handle empty FeatureCollection", () => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    const osmXml = geojsonToOsmPolygons(geojson);
    expect(osmXml).toContain(
      '<osm version="0.6" generator="HOT-fAIr-(v0.1)"/>'
    );
  });
});
