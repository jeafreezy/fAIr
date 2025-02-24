import { LngLatBoundsLike } from "maplibre-gl";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { UseMutationResult } from "@tanstack/react-query";

import { HOT_FAIR_MODEL_CREATION_SESSION_STORAGE_KEY } from "@/config";
import {
  APPLICATION_ROUTES,
  MODELS_BASE,
  MODELS_ROUTES,
  TOAST_NOTIFICATIONS,
} from "@/constants";
import {
  BASE_MODELS,
  MODEL_CREATION_FORM_NAME,
  TrainingDatasetOption,
  TrainingType,
} from "@/enums";
import {
  TCreateTrainingDatasetArgs,
  TCreateTrainingRequestArgs,
} from "@/features/model-creation/api/create-trainings";
import {
  useCreateModel,
  useCreateModelTrainingRequest,
  useUpdateModel,
} from "@/features/model-creation/hooks/use-models";
import { useCreateTrainingDataset } from "@/features/model-creation/hooks/use-training-datasets";
import { useGetTrainingDataset } from "@/features/models/hooks/use-dataset";
import { useModelDetails } from "@/features/models/hooks/use-models";
import { useSessionStorage } from "@/hooks/use-storage";
import {
  TTrainingAreaFeature,
  TTrainingDataset,
  TTrainingDetails,
} from "@/types";
import {
  TMS_URL_REGEX_PATTERN,
  showErrorToast,
  showSuccessToast,
} from "@/utils";

export const FORM_VALIDATION_CONFIG = {
  [MODEL_CREATION_FORM_NAME.MODEL_NAME]: {
    maxLength: 40,
    minLength: 10,
  },
  [MODEL_CREATION_FORM_NAME.TMS_URL]: {
    pattern: TMS_URL_REGEX_PATTERN.source,
  },
  [MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]: {
    maxLength: 500,
    minLength: 10,
  },
  [MODEL_CREATION_FORM_NAME.DATASET_NAME]: {
    maxLength: 40,
    minLength: 10,
  },
  [BASE_MODELS.RAMP]: {
    epoch: {
      max: 30,
      min: 1,
    },
    contactSpacing: {
      max: 8,
      min: 1,
    },
    batchSize: {
      max: 12,
      min: 1,
    },
    boundaryWidth: {
      max: 8,
      min: 1,
    },
  },
  [BASE_MODELS.YOLOV8_V1]: {
    epoch: {
      max: 150,
      min: 20,
    },
    batchSize: {
      max: 16,
      min: 8,
    },
    // These are not used
    contactSpacing: {
      max: 8,
      min: 1,
    },
    boundaryWidth: {
      max: 8,
      min: 1,
    },
  },
  [BASE_MODELS.YOLOV8_V2]: {
    epoch: {
      max: 150,
      min: 20,
    },

    batchSize: {
      max: 16,
      min: 8,
    },
    // These are not used
    contactSpacing: {
      max: 8,
      min: 1,
    },
    boundaryWidth: {
      max: 8,
      min: 1,
    },
  },
};

type FormData = {
  modelName: string;
  modelDescription: string;
  baseModel: BASE_MODELS;
  trainingDatasetOption: TrainingDatasetOption;
  datasetName: string;
  tmsURL: string;
  tmsURLValidation: {
    valid: boolean;
    message: string;
  };
  selectedTrainingDatasetId: string;
  trainingAreas: TTrainingAreaFeature[];
  oamTileName: string;
  oamBounds: number[];
  trainingType: TrainingType;
  contactSpacing: number;
  epoch: number;
  batchSize: number;
  boundaryWidth: number;
  zoomLevels: number[];
  trainingSettingsIsValid: boolean;
};

const initialFormState: FormData = {
  [MODEL_CREATION_FORM_NAME.MODEL_NAME]: "",
  [MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]: "",
  [MODEL_CREATION_FORM_NAME.BASE_MODELS]: BASE_MODELS.RAMP,
  [MODEL_CREATION_FORM_NAME.TRAINING_DATASET_OPTION]:
    TrainingDatasetOption.NONE,
  // create new dataset form
  [MODEL_CREATION_FORM_NAME.DATASET_NAME]: "",
  [MODEL_CREATION_FORM_NAME.TMS_URL]: "",
  [MODEL_CREATION_FORM_NAME.TMS_URL_VALIDITY]: {
    valid: false,
    message: "",
  },
  [MODEL_CREATION_FORM_NAME.SELECTED_TRAINING_DATASET_ID]: "",
  [MODEL_CREATION_FORM_NAME.TRAINING_AREAS]: [],
  // oam tms info
  [MODEL_CREATION_FORM_NAME.OAM_TILE_NAME]: "",
  [MODEL_CREATION_FORM_NAME.OAM_BOUNDS]: [],
  // Training settings - defaults to basic configurations
  [MODEL_CREATION_FORM_NAME.TRAINING_TYPE]: TrainingType.BASIC,
  [MODEL_CREATION_FORM_NAME.EPOCH]: 2,
  [MODEL_CREATION_FORM_NAME.CONTACT_SPACING]: 4,
  [MODEL_CREATION_FORM_NAME.BATCH_SIZE]: 8,
  [MODEL_CREATION_FORM_NAME.BOUNDARY_WIDTH]: 3,
  [MODEL_CREATION_FORM_NAME.ZOOM_LEVELS]: [19, 20, 21],
  [MODEL_CREATION_FORM_NAME.TRAINING_SETTINGS_IS_VALID]: true,
};

const ModelsContext = createContext<{
  formData: typeof initialFormState;
  setFormData: React.Dispatch<React.SetStateAction<typeof initialFormState>>;
  handleChange: (
    field: string,
    value:
      | string
      | boolean
      | number
      | number[]
      | Record<string, string | number | boolean>
      | LngLatBoundsLike
  ) => void;
  createNewTrainingDatasetMutation: UseMutationResult<
    TTrainingDataset,
    Error,
    TCreateTrainingDatasetArgs,
    unknown
  >;
  hasLabeledTrainingAreas: boolean;
  hasAOIsWithGeometry: boolean;
  resetState: () => void;
  createNewTrainingRequestMutation: UseMutationResult<
    TTrainingDetails,
    Error,
    TCreateTrainingRequestArgs,
    unknown
  >;
  isEditMode: boolean;
  modelId?: string;
  getFullPath: (path: string) => string;
  trainingDatasetCreationInProgress: boolean;
  handleModelCreationAndUpdate: () => void;
  handleTrainingDatasetCreation: () => void;
  validateEditMode: boolean;
}>({
  formData: initialFormState,
  setFormData: () => {},
  handleChange: () => {},
  createNewTrainingDatasetMutation: {} as UseMutationResult<
    TTrainingDataset,
    Error,
    TCreateTrainingDatasetArgs,
    unknown
  >,
  createNewTrainingRequestMutation: {} as UseMutationResult<
    TTrainingDetails,
    Error,
    TCreateTrainingRequestArgs,
    unknown
  >,
  hasLabeledTrainingAreas: false,
  hasAOIsWithGeometry: false,
  resetState: () => {},
  isEditMode: false,
  modelId: "",
  getFullPath: () => "",
  handleModelCreationAndUpdate: () => {},
  trainingDatasetCreationInProgress: false,
  handleTrainingDatasetCreation: () => {},
  validateEditMode: false,
});

export const ModelsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { modelId } = useParams();
  const { getSessionValue, setSessionValue, removeSessionValue } =
    useSessionStorage();

  const storedFormData = getSessionValue(
    HOT_FAIR_MODEL_CREATION_SESSION_STORAGE_KEY
  );
  const [formData, setFormData] = useState<typeof initialFormState>(
    storedFormData ? JSON.parse(storedFormData) : initialFormState
  );

  const handleChange = useCallback(
    (
      field: string,
      value:
        | string
        | boolean
        | number
        | number[]
        | Record<string, string | number | boolean>
        | LngLatBoundsLike
    ) => {
      setFormData((prev) => {
        const updatedData = { ...prev, [field]: value };
        setSessionValue(
          HOT_FAIR_MODEL_CREATION_SESSION_STORAGE_KEY,
          JSON.stringify(updatedData)
        );
        return updatedData;
      });
    },
    [setSessionValue]
  );

  const getFullPath = (path: string) =>
    `${isEditMode ? MODELS_BASE + "/" + modelId : MODELS_ROUTES.CREATE_MODEL_BASE}/${path}/`;

  const timeOutRef = useRef<number | null>(null);

  const isEditMode = Boolean(modelId && !pathname.includes("new"));

  const { data, isPending, isError } = useModelDetails(
    modelId as string,
    isEditMode
  );

  const {
    data: trainingDataset,
    isPending: trainingDatasetIsPending,
    isError: trainingDatasetIsError,
  } = useGetTrainingDataset(
    Number(data?.dataset),
    Boolean(isEditMode && data?.dataset)
  );

  // Will be used in the route validator component to delay the redirection for a while until the data are retrieved
  const validateEditMode =
    formData.selectedTrainingDatasetId !== "" && formData.tmsURL !== "";

  // Fetch and prefill model details
  useEffect(() => {
    if (!isEditMode || isPending || !data) return;

    if (isError) {
      navigate(APPLICATION_ROUTES.NOTFOUND);
    }

    handleChange(MODEL_CREATION_FORM_NAME.BASE_MODELS, data.base_model);
    handleChange(
      MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION,
      data.description ?? ""
    );
    handleChange(MODEL_CREATION_FORM_NAME.MODEL_NAME, data.name ?? "");
    handleChange(
      MODEL_CREATION_FORM_NAME.SELECTED_TRAINING_DATASET_ID,
      data.dataset
    );
  }, [isEditMode, isError, isPending, data, navigate, handleChange]);

  // Fetch and prefill training dataset
  useEffect(() => {
    if (!isEditMode || trainingDatasetIsPending || trainingDatasetIsError)
      return;
    handleChange(
      MODEL_CREATION_FORM_NAME.DATASET_NAME,
      trainingDataset.name ?? ""
    );
    handleChange(
      MODEL_CREATION_FORM_NAME.TMS_URL,
      trainingDataset.source_imagery ?? ""
    );
  }, [
    isEditMode,
    trainingDatasetIsPending,
    trainingDataset,
    trainingDatasetIsError,
    handleChange,
  ]);

  useEffect(() => {
    // Cleanup the timeout on component unmount
    return () => {
      removeSessionValue(HOT_FAIR_MODEL_CREATION_SESSION_STORAGE_KEY);
      const timeoutId = timeOutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [removeSessionValue]);

  const resetState = () => {
    removeSessionValue(HOT_FAIR_MODEL_CREATION_SESSION_STORAGE_KEY);
    setFormData(initialFormState);
  };

  const createNewTrainingRequestMutation = useCreateModelTrainingRequest({
    mutationConfig: {
      onSuccess: () => {
        showSuccessToast(TOAST_NOTIFICATIONS.trainingRequestSubmittedSuccess);
        // Reset the state after 2 second on the model success page.
        resetState();
      },
      onError: (error) => {
        showErrorToast(error);
        resetState();
      },
    },
  });

  const createNewTrainingDatasetMutation = useCreateTrainingDataset({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast(TOAST_NOTIFICATIONS.trainingDatasetCreationSuccess);
        handleChange(MODEL_CREATION_FORM_NAME.DATASET_NAME, data.name);
        handleChange(MODEL_CREATION_FORM_NAME.TMS_URL, data.source_imagery);
        handleChange(
          MODEL_CREATION_FORM_NAME.SELECTED_TRAINING_DATASET_ID,
          data.id
        );
        // Navigate to the next step
        navigate(APPLICATION_ROUTES.CREATE_NEW_MODEL_TRAINING_AREA);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const handleModelCreationOrUpdateSuccess = (modelId: string) => {
    showSuccessToast(
      isEditMode
        ? TOAST_NOTIFICATIONS.modelUpdateSuccess
        : TOAST_NOTIFICATIONS.modelCreationSuccess
    );
    navigate(`${getFullPath(MODELS_ROUTES.CONFIRMATION)}?id=${modelId}`);
    // Submit the model for training request
    createNewTrainingRequestMutation.mutate({
      model: modelId,
      input_boundary_width: formData.boundaryWidth,
      input_contact_spacing: formData.contactSpacing,
      epochs: formData.epoch,
      batch_size: formData.batchSize,
      zoom_level: formData.zoomLevels,
    });
  };

  const modelCreateMutation = useCreateModel({
    mutationConfig: {
      onSuccess: (data) => {
        handleModelCreationOrUpdateSuccess(data.id);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const modelUpdateMutation = useUpdateModel({
    mutationConfig: {
      onSuccess: (data) => {
        handleModelCreationOrUpdateSuccess(data.id);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
    modelId: modelId as string,
  });

  // Confirm that all the training areas labels has been retrieved
  const hasLabeledTrainingAreas =
    formData.trainingAreas.length > 0 &&
    formData.trainingAreas.filter(
      (aoi: TTrainingAreaFeature) => aoi.properties.label_fetched === null
    ).length === 0;

  // Confirm that all of the training areas has a geometry
  const hasAOIsWithGeometry =
    formData.trainingAreas.length > 0 &&
    formData.trainingAreas.filter(
      (aoi: TTrainingAreaFeature) => aoi.geometry === null
    ).length === 0;

  const handleTrainingDatasetCreation = useCallback(() => {
    createNewTrainingDatasetMutation.mutate({
      source_imagery: formData.tmsURL,
      name: formData.datasetName,
    });
  }, [createNewTrainingDatasetMutation, formData.datasetName, formData.tmsURL]);
  const trainingDatasetCreationInProgress =
    createNewTrainingDatasetMutation.isPending;

  const handleModelCreationAndUpdate = useCallback(() => {
    if (isEditMode) {
      modelUpdateMutation.mutate({
        dataset: formData.selectedTrainingDatasetId,
        name: formData.modelName,
        description: formData.modelDescription,
        base_model: formData.baseModel as BASE_MODELS,
        modelId: modelId as string,
      });
    } else {
      modelCreateMutation.mutate({
        dataset: formData.selectedTrainingDatasetId,
        name: formData.modelName,
        description: formData.modelDescription,
        base_model: formData.baseModel,
      });
    }
  }, [modelCreateMutation, modelId, formData, modelUpdateMutation, isEditMode]);

  const memoizedValues = useMemo(
    () => ({
      setFormData,
      handleChange,
      createNewTrainingDatasetMutation,
      hasLabeledTrainingAreas,
      hasAOIsWithGeometry,
      formData,
      resetState,
      createNewTrainingRequestMutation,
      isEditMode,
      modelId,
      getFullPath,
      handleModelCreationAndUpdate,
      handleTrainingDatasetCreation,
      trainingDatasetCreationInProgress,
      validateEditMode,
    }),
    [
      setFormData,
      formData,
      handleChange,
      createNewTrainingDatasetMutation,
      hasLabeledTrainingAreas,
      hasAOIsWithGeometry,
      resetState,
      createNewTrainingRequestMutation,
      isEditMode,
      modelId,
      getFullPath,
      handleModelCreationAndUpdate,
      handleTrainingDatasetCreation,
      trainingDatasetCreationInProgress,
      validateEditMode,
    ]
  );

  return (
    <ModelsContext.Provider value={memoizedValues}>
      {children}
    </ModelsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModelsContext = () => useContext(ModelsContext);
