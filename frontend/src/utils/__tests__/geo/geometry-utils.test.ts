import { Feature } from "geojson";
import { describe, expect, it } from "vitest";

import { TModelPredictions, TModelPredictionsConfig } from "@/types";
import {
  calculateGeoJSONArea,
  formatAreaInAppropriateUnit,
  getGeoJSONFeatureBounds,
  handleConflation,
} from "@/utils";

const predictionConfig: TModelPredictionsConfig = {
  area_threshold: 6,
  bbox: [0, 0, 0, 0],
  checkpoint: "",
  confidence: 95,
  max_angle_change: 0,
  model_id: "",
  use_josm_q: true,
  skew_tolerance: 0,
  zoom_level: 21,
  source: "",
  tolerance: 0,
};

describe("geometry-utils", () => {
  it("should calculate the area of a GeoJSON Feature", () => {
    const feature: Feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-10, -10],
            [10, -10],
            [10, 10],
            [-10, 10],
            [-10, -10],
          ],
        ],
      },
      properties: {},
    };
    const result = calculateGeoJSONArea(feature);
    expect(result).toBeGreaterThan(0);
  });

  it("should format area into human readable string", () => {
    const result = formatAreaInAppropriateUnit(12222000);
    expect(result).toBe("12.2km²");
  });

  it("should compute the bounding box of a GeoJSON Feature", () => {
    const feature: Feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-10, -10],
            [10, -10],
            [10, 10],
            [-10, 10],
            [-10, -10],
          ],
        ],
      },
      properties: {},
    };
    const result = getGeoJSONFeatureBounds(feature);
    expect(result).toEqual([-10, -10, 10, 10]);
  });

  it("should handle conflation of new features with existing predictions", () => {
    const existingPredictions = {
      all: [],
      accepted: [],
      rejected: [],
    };
    const newFeatures: Feature[] = [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [10, 10],
              [20, 20],
              [30, 30],
              [10, 10],
            ],
          ],
        },
        properties: {},
      },
    ];

    const result = handleConflation(
      existingPredictions,
      newFeatures,
      predictionConfig
    );
    expect(result.all.length).toBe(1);
  });

  it("should replace existing feature if it intersects with new feature", () => {
    const existingPredictions = {
      all: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [15, 15],
                [25, 25],
                [35, 35],
                [15, 15],
              ],
            ],
          },
          properties: { config: predictionConfig, _id: "existing" },
        },
      ],
      accepted: [],
      rejected: [],
    } as TModelPredictions;
    const newFeatures: Feature[] = [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [20, 30],
              [25, 25],
              [35, 35],
              [20, 30],
            ],
          ],
        },
        properties: {},
      },
    ];

    const result = handleConflation(
      existingPredictions,
      newFeatures,
      predictionConfig
    );
    expect(result.all.length).toBe(1);
    expect(result.all[0].properties?._id).not.toBe("existing");
  });

  it("should replace the correct feature if multiple features intersect", () => {
    const existingPredictions = {
      all: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [5, 5],
                [15, 5],
                [15, 15],
                [5, 15],
                [5, 5],
              ],
            ],
          },
          properties: { _id: "existing1", config: predictionConfig },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [20, 20],
                [30, 20],
                [30, 30],
                [20, 30],
                [20, 20],
              ],
            ],
          },
          properties: { _id: "existing2", config: predictionConfig },
        },
      ],
      accepted: [],
      rejected: [],
    } as TModelPredictions;
    const newFeatures: Feature[] = [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [20, 20],
              [30, 20],
              [30, 30],
              [20, 30],
              [20, 20],
            ],
          ],
        },
        properties: {},
      },
    ];

    const result = handleConflation(
      existingPredictions,
      newFeatures,
      predictionConfig
    );
    expect(result.all.length).toBe(2);
    expect(result.all[1].properties?._id).not.toBe("existing2");
    expect(result.all[0].properties?._id).toBe("existing1");
  });

  it("should not add new feature if it intersects with accepted feature", () => {
    const existingPredictions = {
      all: [],
      accepted: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [10, 10],
                [20, 20],
                [30, 30],
                [10, 10],
              ],
            ],
          },
          properties: { config: predictionConfig },
        },
      ],
      rejected: [],
    } as TModelPredictions;
    const newFeatures: Feature[] = [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [15, 15],
              [25, 25],
              [35, 35],
              [15, 15],
            ],
          ],
        },
        properties: {},
      },
    ];

    const result = handleConflation(
      existingPredictions,
      newFeatures,
      predictionConfig
    );
    expect(result.all.length).toBe(0);
    expect(result.accepted.length).toBe(1);
    expect(result.rejected.length).toBe(0);
  });

  it("should not add new feature if it intersects with rejected feature", () => {
    const existingPredictions = {
      all: [],
      accepted: [],
      rejected: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [10, 10],
                [20, 20],
                [30, 30],
                [10, 10],
              ],
            ],
          },
          properties: { config: predictionConfig },
        },
      ],
    } as TModelPredictions;

    const newFeatures: Feature[] = [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [15, 15],
              [25, 25],
              [35, 35],
              [15, 15],
            ],
          ],
        },
        properties: {},
      },
    ];

    const result = handleConflation(
      existingPredictions,
      newFeatures,
      predictionConfig
    );
    expect(result.all.length).toBe(0);
    expect(result.rejected.length).toBe(1);
    expect(result.accepted.length).toBe(0);
  });
});
