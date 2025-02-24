export enum LayoutView {
  LIST = "list",
  GRID = "grid",
}

/**
 * The names here are the same with the `initialFormState` object keys.
 * They are also the same with the form validation configuration object keys.
 */
export enum MODEL_CREATION_FORM_NAME {
  MODEL_NAME = "modelName",
  DATASET_NAME = "datasetName",
  MODEL_DESCRIPTION = "modelDescription",
  BASE_MODELS = "baseModel",
  TRAINING_DATASET_OPTION = "trainingDatasetOption",
  ZOOM_LEVELS = "zoomLevels",
  TRAINING_TYPE = "trainingType",
  EPOCH = "epoch",
  CONTACT_SPACING = "contactSpacing",
  BATCH_SIZE = "batchSize",
  BOUNDARY_WIDTH = "boundaryWidth",
  TMS_URL = "tmsURL",
  TMS_URL_VALIDITY = "tmsURLValidation",
  SELECTED_TRAINING_DATASET_ID = "selectedTrainingDatasetId",
  OAM_TILE_NAME = "oamTileName",
  OAM_BOUNDS = "oamBounds",
  TRAINING_AREAS = "trainingAreas",
  TRAINING_SETTINGS_IS_VALID = "trainingSettingsIsValid",
}
