import { Feature } from "geojson";
import maplibregl, { LngLat, Map, Popup } from "maplibre-gl";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { geojsonToWKT } from "@terraformer/wkt";

import { useAuth } from "@/app/providers/auth-provider";
import { Input } from "@/components/ui/form";
import { CheckIcon } from "@/components/ui/icons";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { SHOELACE_SIZES } from "@/enums";
import {
  useCreateApprovedModelPrediction,
  useCreateModelFeedback,
  useDeleteApprovedModelPrediction,
  useDeleteModelPredictionFeedback,
} from "@/features/start-mapping/hooks/use-feedbacks";
import {
  GeoJSONType,
  TModelPredictionFeature,
  TModelPredictions,
} from "@/types";
import { showErrorToast } from "@/utils";

const PredictedFeatureActionPopup = ({
  mousePosition,
  selectedFeature,
  setModelPredictions,
  modelPredictions,
  trainingId,
  source_imagery,
  map,
}: {
  mousePosition: LngLat | null;
  selectedFeature: Feature | null;
  modelPredictions: TModelPredictions;
  setModelPredictions: Dispatch<
    SetStateAction<{
      all: TModelPredictionFeature[];
      accepted: TModelPredictionFeature[];
      rejected: TModelPredictionFeature[];
    }>
  >;
  source_imagery: string;
  trainingId: number;
  map: Map | null;
}) => {
  const featureId = selectedFeature?.properties?.id;
  const { user } = useAuth();

  const popupRef = useRef(null);
  const [popup, setPopup] = useState<Popup | null>(null);
  const { accepted, rejected, all } = modelPredictions;

  const alreadyAccepted = accepted.some(
    (feature) => feature.properties.id === featureId
  );
  const alreadyRejected = rejected.some(
    (feature) => feature.properties.id === featureId
  );

  // if already accepted, it means it's in accepted array
  // if it's already rejected, it means it's in the rejected array
  // if it's not in accepted or rejected, then it's in the all array
  const feature =
    accepted.find((f) => f.properties.id === featureId) ||
    rejected.find((f) => f.properties.id === featureId) ||
    all.find((f) => f.properties.id === featureId);

  const [showComment, setShowComment] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");

  const moveFeature = (
    source: TModelPredictionFeature[],
    target: TModelPredictionFeature[],
    id: number,
    additionalProperties: Partial<TModelPredictionFeature["properties"]> = {}
  ) => {
    const movedFeatures = source
      .filter((feature) => feature.properties.id === id)
      .map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          ...additionalProperties,
        },
      }));

    return {
      updatedSource: source.filter((feature) => feature.properties.id !== id),
      updatedTarget: [...target, ...movedFeatures],
    };
  };

  useEffect(() => {
    if (!map || !popupRef.current || !mousePosition) return;
    // reset if in comment mode
    setShowComment(false);
    const _popup = new maplibregl.Popup({ closeButton: false })
      .setLngLat(mousePosition)
      .setDOMContent(popupRef.current)
      .addTo(map);
    setPopup(_popup);
    return () => {
      _popup.remove();
    };
  }, [mousePosition, map, selectedFeature, setShowComment]);

  const closePopup = () => {
    popup?.remove();
    setShowComment(false);
    setComment("");
  };

  const handleRejection = () => {
    setShowComment(true);
  };

  // Approved prediction is accept

  const createApprovedModelPredictionMutation =
    useCreateApprovedModelPrediction({
      mutationConfig: {
        onSuccess: (data) => {
          const { updatedSource, updatedTarget } = alreadyRejected
            ? moveFeature(rejected, accepted, featureId, {
                _id: data.id,
                ...data.properties,
              })
            : moveFeature(all, accepted, featureId, {
                _id: data.id,
                ...data.properties,
              });

          setModelPredictions((prev) => ({
            ...prev,
            rejected: alreadyRejected ? updatedSource : prev.rejected,
            all: alreadyRejected ? prev.all : updatedSource,
            accepted: updatedTarget,
          }));
          closePopup();
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const deleteModelFeedbackMutation = useDeleteModelPredictionFeedback({
    mutationConfig: {
      onSuccess: (_, variables) => {
        if (variables.approvePrediction) {
          submitApprovedPrediction();
        } else {
          const { updatedSource: updatedRejected } = moveFeature(
            rejected,
            all,
            featureId
          );
          setModelPredictions((prev) => ({
            ...prev,
            all: [
              ...all,
              ...rejected.filter((f) => f.properties.id === featureId),
            ],
            rejected: updatedRejected,
          }));
        }
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const deleteApprovedModelPrediction = useDeleteApprovedModelPrediction({
    mutationConfig: {
      onSuccess: async (_, variables) => {
        if (variables.createFeedback) {
          await createModelFeedbackMutation.mutateAsync({
            zoom_level: feature?.properties.config.zoom_level as number,
            comments: comment,
            geom: geojsonToWKT(feature?.geometry as GeoJSONType),
            feedback_type: "TN",
            source_imagery: source_imagery,
            training: trainingId,
          });
        } else {
          const { updatedSource: updatedAccepted } = moveFeature(
            accepted,
            all,
            featureId
          );
          setModelPredictions((prev) => ({
            ...prev,
            all: [
              ...all,
              ...accepted.filter((f) => f.properties.id === featureId),
            ],
            accepted: updatedAccepted,
          }));
        }
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const submitApprovedPrediction = async () => {
    await createApprovedModelPredictionMutation.mutateAsync({
      geom: geojsonToWKT(feature?.geometry as GeoJSONType),
      training: trainingId,
      config: {
        // Use the configuration when the prediction was made.
        area_threshold: feature?.properties.config.area_threshold as number,
        confidence: feature?.properties.config.confidence as number,
        use_josm_q: feature?.properties.config.use_josm_q as boolean,
        max_angle_change: feature?.properties.config.max_angle_change as number,
        skew_tolerance: feature?.properties.config.skew_tolerance as number,
        tolerance: feature?.properties.config.tolerance as number,
        zoom_level: feature?.properties.config.zoom_level as number,
      },
      user: user.osm_id,
    });
  };

  // Rejection is the same as feedback
  const createModelFeedbackMutation = useCreateModelFeedback({
    mutationConfig: {
      onSuccess: (data) => {
        if (alreadyAccepted) {
          const { updatedSource, updatedTarget } = moveFeature(
            accepted,
            rejected,
            featureId,
            // update the feature with the returned id from the backend as `_id`.
            { _id: data.id }
          );
          setModelPredictions((prev) => ({
            ...prev,
            accepted: updatedSource,
            rejected: updatedTarget,
          }));
        } else {
          const { updatedSource, updatedTarget } = moveFeature(
            all,
            rejected,
            featureId,
            // update the feature with the returned id from the backend as `_id`.
            { _id: data.id }
          );
          setModelPredictions((prev) => ({
            ...prev,
            all: updatedSource,
            rejected: updatedTarget,
          }));
        }
        closePopup();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const submitRejectionFeedback = async () => {
    if (alreadyAccepted) {
      await deleteApprovedModelPrediction.mutateAsync({
        id: feature?.properties._id as number,
        createFeedback: true,
      });
    } else {
      await createModelFeedbackMutation.mutateAsync({
        zoom_level: feature?.properties.config.zoom_level as number,
        comments: comment,
        geom: geojsonToWKT(feature?.geometry as GeoJSONType),
        feedback_type: "TN",
        source_imagery: source_imagery,
        training: trainingId,
      });
    }
  };

  const handleResolve = async () => {
    if (alreadyRejected) {
      await deleteModelFeedbackMutation.mutateAsync({
        id: feature?.properties._id as number,
      });
    } else if (alreadyAccepted) {
      await deleteApprovedModelPrediction.mutateAsync({
        id: feature?.properties._id as number,
      });
    }
    closePopup();
  };

  const handleAcceptance = async () => {
    if (alreadyRejected) {
      await deleteModelFeedbackMutation.mutateAsync({
        id: feature?.properties._id as number,
        approvePrediction: true,
      });
    } else {
      submitApprovedPrediction();
    }
  };

  const primaryButton = alreadyAccepted
    ? {
        label: START_MAPPING_PAGE_CONTENT.map.popup.reject,
        action: handleRejection,
        className: "bg-primary",
        icon: RejectIcon,
      }
    : alreadyRejected
      ? {
          label: START_MAPPING_PAGE_CONTENT.map.popup.resolve,
          action: handleResolve,
          className: "bg-black",
          icon: ResolveIcon,
        }
      : {
          label: START_MAPPING_PAGE_CONTENT.map.popup.accept,
          action: handleAcceptance,
          className: "bg-green-primary",
          icon: AcceptIcon,
        };

  const secondaryButton = alreadyAccepted
    ? {
        label: START_MAPPING_PAGE_CONTENT.map.popup.resolve,
        action: handleResolve,
        className: "bg-black",
        icon: ResolveIcon,
      }
    : alreadyRejected
      ? {
          label: START_MAPPING_PAGE_CONTENT.map.popup.accept,
          action: handleAcceptance,
          className: "bg-green-primary",
          icon: AcceptIcon,
        }
      : {
          label: START_MAPPING_PAGE_CONTENT.map.popup.reject,
          action: handleRejection,
          className: "bg-primary",
          icon: RejectIcon,
        };

  return (
    <div
      className="flex w-fit flex-col gap-y-4 rounded-xl bg-white p-4 md:w-[300px]"
      ref={popupRef}
    >
      <div className="flex items-center justify-between">
        <p className="text-body-3 font-semibold md:text-body-2base">
          {showComment
            ? START_MAPPING_PAGE_CONTENT.map.popup.commentTitle
            : START_MAPPING_PAGE_CONTENT.map.popup.defaultTitle}
        </p>
        <button
          className="self-end text-sm text-dark md:text-lg"
          onClick={closePopup}
          title="Close"
        >
          &#x2715;
        </button>
      </div>
      {showComment && (
        <Input
          handleInput={(e) => setComment(e.target.value)}
          value={comment}
          showBorder
          label={START_MAPPING_PAGE_CONTENT.map.popup.comment.description}
          placeholder={START_MAPPING_PAGE_CONTENT.map.popup.comment.placeholder}
          size={SHOELACE_SIZES.MEDIUM}
        />
      )}
      {showComment && (
        <button
          className={`w-fit text-nowrap rounded-lg bg-primary px-6 py-2 text-body-4 text-white md:text-body-3`}
          onClick={submitRejectionFeedback}
          disabled={createModelFeedbackMutation.isPending}
        >
          {createModelFeedbackMutation.isPending
            ? START_MAPPING_PAGE_CONTENT.map.popup.comment.submissionInProgress
            : START_MAPPING_PAGE_CONTENT.map.popup.comment.submit}
        </button>
      )}
      {!showComment && (
        <p className="text-xs md:text-sm">
          {START_MAPPING_PAGE_CONTENT.map.popup.description}
        </p>
      )}
      {!showComment && (
        <div className="flex items-center justify-between gap-x-6">
          <button
            className={`w-full ${primaryButton.className} flex items-center justify-between gap-x-3 text-nowrap rounded-lg p-2 text-body-4 text-white md:text-body-3`}
            onClick={primaryButton.action}
          >
            {primaryButton.label}
            <primaryButton.icon />
          </button>
          <button
            className={`w-full ${secondaryButton.className} flex items-center justify-between gap-x-3 text-nowrap rounded-lg p-2 text-body-4 text-white md:text-body-3`}
            onClick={secondaryButton.action}
          >
            {secondaryButton.label}
            <secondaryButton.icon />
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictedFeatureActionPopup;

const RejectIcon = () => {
  return (
    <span className="flex size-4 items-center justify-center rounded-full border p-1 text-xs">
      &#x2715;
    </span>
  );
};

const AcceptIcon = () => {
  return (
    <span className="flex size-4 items-center justify-center rounded-full border">
      <CheckIcon className="size-2" />
    </span>
  );
};

const ResolveIcon = () => {
  return (
    <span className="flex size-4 items-center justify-center rounded-full border">
      -
    </span>
  );
};
