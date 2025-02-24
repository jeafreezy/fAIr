import { TrainingSettingsStep } from "@/features/model-creation/components";

export const ModelTrainingSettingsPage = () => {
  return (
    <div
      className={
        "col-span-12 md:col-span-10 md:col-start-2 lg:col-span-6 lg:col-start-4"
      }
    >
      <TrainingSettingsStep />
    </div>
  );
};
