import { MODELS_CONTENT } from "@/constants";
import { TextArea } from "@/components/ui/form";
import {
  FORM_VALIDATION_CONFIG,
  MODEL_CREATION_FORM_NAME,
} from "@/app/providers/models-provider";
import { useEffect, useState } from "react";

const ModelDescriptionFormInput = ({
  handleChange,
  value,
}: {
  value: string;
  handleChange: (value: string) => void;
}) => {
  const [modelDescriptionIsValid, setmodelDescriptionIsValid] = useState({
    valid: false,
    message: "",
  });

  useEffect(() => {
    const minLengthValidation =
      value.length >=
      FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
        .minLength;
    const maxLengthValidation =
      value.length <=
      FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
        .maxLength;

    const valid = minLengthValidation && maxLengthValidation;
    const message = !minLengthValidation
      ? `Name must be at least ${
          FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
            .minLength
        } characters long.`
      : !maxLengthValidation
        ? `Name must be no more than ${
            FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
              .maxLength
          } characters long.`
        : "";
    setmodelDescriptionIsValid({ valid, message });
  }, [value]);

  return (
    <TextArea
      handleChange={(e) => handleChange(e.target.value)}
      label={
        MODELS_CONTENT.modelCreation.modelDetails.form.modelDescription.label
      }
      helpText={modelDescriptionIsValid.message}
      validationStateUpdateCallback={setmodelDescriptionIsValid}
      isValid={modelDescriptionIsValid.valid}
      labelWithTooltip
      toolTipContent={
        MODELS_CONTENT.modelCreation.modelDetails.form.modelDescription.toolTip
      }
      placeholder={
        MODELS_CONTENT.modelCreation.modelDetails.form.modelDescription
          .placeholder
      }
      value={value}
      maxLength={
        FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
          .maxLength
      }
      minLength={
        FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.MODEL_DESCRIPTION]
          .minLength
      }
    />
  );
};

export default ModelDescriptionFormInput;
