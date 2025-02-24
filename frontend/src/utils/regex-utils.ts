/**
 * Regular expression pattern to match TMS (Tile Map Service) URLs.
 *
 * This pattern ensures that the URL starts with "https://", followed by any characters,
 * and contains placeholders for zoom level (`{z}`), x-coordinate (`{x}`), and y-coordinate (`{y}`).
 *
 * Example of a matching URL:
 * https://example.com/{z}/{x}/{y}.png
 */
export const TMS_URL_REGEX_PATTERN = /^https:\/\/.*\/\{z\}\/\{x\}\/\{y\}.*$/;

/**
 * Regular expression pattern to match OpenAerialMap TMS (Tile Map Service) URLs.
 *
 * This pattern ensures that the URL starts with "https://tiles.openaerialmap.org/", followed by any characters,
 * and contains placeholders for zoom level (`{z}`), x-coordinate (`{x}`), and y-coordinate (`{y}`).
 *
 * Example of a matching URL:
 * https://tiles.openaerialmap.org/63b457ba3fb8c100063c55f0/0/63b457ba3fb8c100063c55f1/{z}/{x}/{y}
 */
export const OPENAERIALMAP_TMS_URL_REGEX_PATTERN =
  /^https:\/\/tiles\.openaerialmap\.org\/.*\/\{z\}\/\{x\}\/\{y\}.*$/;
