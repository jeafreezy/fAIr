import { useState } from "react";

import { useModelsContext } from "@/app/providers/models-provider";
import { HelpText, Input } from "@/components/ui/form";
import { CheckIcon } from "@/components/ui/icons";
import { SearchIcon } from "@/components/ui/icons";
import { SkeletonWrapper } from "@/components/ui/skeleton";
import { MODELS_CONTENT } from "@/constants";
import { MODEL_CREATION_FORM_NAME } from "@/enums";
import { useGetTrainingDatasets } from "@/features/model-creation/hooks/use-training-datasets";
import useDebounce from "@/hooks/use-debounce";

const SelectExistingTrainingDatasetForm = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { formData, handleChange } = useModelsContext();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data, isPending, isError } =
    useGetTrainingDatasets(debouncedSearchQuery);

  return (
    <div className="flex flex-col gap-y-10">
      <div>
        <p className="mb-2 text-body-2 font-semibold md:text-body-1">
          {
            MODELS_CONTENT.modelCreation.trainingDataset.form
              .existingTrainingDatasetSectionHeading
          }
        </p>
        <HelpText
          content={
            MODELS_CONTENT.modelCreation.trainingDataset.form
              .existingTrainingDatasetSectionDescription
          }
        />
      </div>
      <div className={`flex  items-center border border-gray-border`}>
        <SearchIcon className={`icon-lg ml-2 text-dark`} />
        <Input
          handleInput={(e) => {
            setSearchQuery(e.target.value);
          }}
          value={searchQuery}
          placeholder={
            MODELS_CONTENT.modelCreation.trainingDataset.form.searchBar
              .placeholder
          }
          disabled={isError}
          className="w-full"
        />
      </div>

      <div
        className={`flex h-80 flex-col gap-y-4 overflow-scroll  rounded-sm border border-light-gray p-2 ${isError && "items-center justify-center"}`}
      >
        {isError ? (
          <p className="text-center">Failed to retrieve training datasets.</p>
        ) : (
          <SkeletonWrapper showSkeleton={isPending} skeletonClassName="h-80">
            <ul className="flex flex-col gap-y-2">
              {data &&
                data
                  .filter((td) =>
                    td.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((td, id) => (
                    <li
                      key={`training-dataset-${id}`}
                      className={`flex cursor-pointer items-center justify-between p-2 hover:bg-off-white ${formData.selectedTrainingDatasetId === String(td.id) && "bg-off-white"}`}
                    >
                      <button
                        disabled={!td.source_imagery}
                        className="w-full text-start"
                        onClick={() => {
                          handleChange(
                            MODEL_CREATION_FORM_NAME.SELECTED_TRAINING_DATASET_ID,
                            String(td.id)
                          );
                          // Also update other parameters
                          handleChange(
                            MODEL_CREATION_FORM_NAME.TMS_URL,
                            String(td.source_imagery)
                          );

                          handleChange(
                            MODEL_CREATION_FORM_NAME.DATASET_NAME,
                            String(td.name)
                          );
                        }}
                      >
                        <p className="flex flex-col">
                          {td.name}{" "}
                          {!td.source_imagery && (
                            <small className="italic">(Invalid TMS URL)</small>
                          )}
                          <small>ID: {td.id}</small>
                        </p>
                      </button>
                      {formData.selectedTrainingDatasetId === String(td.id) && (
                        <span className="icon flex items-center justify-center rounded-full bg-green-primary p-1">
                          <CheckIcon className=" text-white" />
                        </span>
                      )}
                    </li>
                  ))}
            </ul>
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
};

export default SelectExistingTrainingDatasetForm;
