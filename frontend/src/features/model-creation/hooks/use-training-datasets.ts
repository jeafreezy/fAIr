import { useMutation, useQuery } from "@tanstack/react-query";

import {
  TCreateTrainingDatasetArgs,
  createTrainingDataset,
} from "@/features/model-creation/api/create-trainings";
import { getTrainingDatasetsQueryOptions } from "@/features/model-creation/api/factory";
import { MutationConfig } from "@/services";

export const useGetTrainingDatasets = (searchQuery: string) => {
  return useQuery({
    ...getTrainingDatasetsQueryOptions(searchQuery),
  });
};

type useCreateTrainingDatasetOptions = {
  mutationConfig?: MutationConfig<typeof createTrainingDataset>;
};

export const useCreateTrainingDataset = ({
  mutationConfig,
}: useCreateTrainingDatasetOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: (args: TCreateTrainingDatasetArgs) =>
      createTrainingDataset(args),
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
