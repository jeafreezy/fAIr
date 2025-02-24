import { ChevronDownIcon } from "@/components/ui/icons";
import { MODELS_CONTENT } from "@/constants";

export const TrainingAreaButton = ({
  disabled,
  onClick,
}: {
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      className="flex cursor-pointer items-center gap-x-2 text-body-3 text-primary md:self-end md:text-body-2 md:font-semibold"
      onClick={onClick}
    >
      <p>{MODELS_CONTENT.models.modelsDetailsCard.viewTrainingArea}</p>
      <ChevronDownIcon className="icon -rotate-90" />
    </button>
  );
};
