export const XYZ_TILESERVER_URL_REGEX_PATTERN =
  /^https:\/\/.*\/\{z\}\/\{x\}\/\{y\}.*$|^https:\/\/.*\/\{z\}\/\{y\}\/\{x\}.*$/; //;

// Allows letters, numbers, and spaces

export const VALID_CHARACTER_PATTERN = /^[a-zA-Z0-9\s]*$/;

// Matches valid model checkpoint URLs with .onnx or .tflite extensions.
export const VALID_MODEL_CHECKPOINT_PATH =
  /^https?:\/\/.*\/[^\/]+\.(onnx|tflite)\/?/;

// Matches valid OpenAerialMap tile server URLs.
export const OPENAERIALMAP_TILESERVER_URL_REGEX_PATTERN =
  /^https:\/\/tiles\.openaerialmap\.org\/[a-zA-Z0-9]+\/\d+\/[a-zA-Z0-9]+\/\{z\}\/\{x\}\/\{y\}$/;
