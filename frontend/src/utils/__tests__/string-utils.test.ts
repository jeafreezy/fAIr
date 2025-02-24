import { describe, expect, it } from "vitest";

import { OAM_S3_BUCKET_URL, OAM_TITILER_ENDPOINT } from "@/config";

import { extractTileJSONURL, truncateString } from "../string-utils";

describe("truncateString", () => {
  it("should truncate a string longer than the specified maxLength and append ellipsis", () => {
    const result = truncateString(
      "This is a very long string that needs to be truncated",
      20
    );
    expect(result).toBe("This is a very lo...");
  });

  it("should return the original string if it is shorter than the specified maxLength", () => {
    const result = truncateString("Short string", 20);
    expect(result).toBe("Short string");
  });

  it("should return the original string if it is exactly the specified maxLength", () => {
    const result = truncateString("Exact length string", 19);
    expect(result).toBe("Exact length string");
  });

  it("should handle undefined input gracefully", () => {
    const result = truncateString(undefined, 20);
    expect(result).toBeUndefined();
  });

  it("should use the default maxLength of 30 if not specified", () => {
    const result = truncateString("This string is exactly thirty..");
    expect(result).toBe("This string is exactly thir...");
  });
});

describe("extractTileJSONURL", () => {
  it("should construct the correct TileJSON URL from a TMS URL", () => {
    const result = extractTileJSONURL(
      "https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y}"
    );
    expect(result).toBe(
      `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1.tif`
    );
  });

  it("should handle URLs without the TMS pattern", () => {
    const result = extractTileJSONURL(
      "https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1"
    );
    expect(result).toBe(
      `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1.tif`
    );
  });

  it("should handle URLs with query parameters", () => {
    const result = extractTileJSONURL(
      "https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y}?token=abc123"
    );
    expect(result).toBe(
      `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1.tif`
    );
  });

  it("should handle URLs with different file extensions", () => {
    const result = extractTileJSONURL(
      "https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y}.jpeg"
    );
    expect(result).toBe(
      `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1.tif`
    );
  });

  it("should handle URLs with subdomains", () => {
    const result = extractTileJSONURL(
      "https://sub.tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y}"
    );
    expect(result).toBe(
      `${OAM_TITILER_ENDPOINT}cog/WebMercatorQuad/tilejson.json?url=${OAM_S3_BUCKET_URL}63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1.tif`
    );
  });
});
