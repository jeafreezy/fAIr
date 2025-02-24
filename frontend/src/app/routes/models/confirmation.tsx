import ConfettiExplosion from "react-confetti-explosion";
import { useSearchParams } from "react-router-dom";

import { useModelsContext } from "@/app/providers/models-provider";
import { ModelFormConfirmation } from "@/assets/images";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { APPLICATION_ROUTES, MODELS_CONTENT } from "@/constants";

export const ModelConfirmationPage = () => {
  const [searchParams] = useSearchParams();

  const modelId = searchParams.get("id");
  const { isEditMode } = useModelsContext();

  return (
    <div
      className={
        "col-span-12 flex flex-col gap-y-10 md:col-span-8 md:col-start-3"
      }
    >
      <div className="flex size-full flex-col items-center justify-center gap-y-10 text-center">
        <ConfettiExplosion
          force={0.2}
          duration={5000}
          particleCount={250}
          height={10000}
        />
        <Image src={ModelFormConfirmation} alt="Model Creation Success Icon" />
        <p className="text-title-2">
          Model {modelId} is {isEditMode ? "Updated" : "Created"}!
        </p>
        <p className="text-gray">
          {MODELS_CONTENT.modelCreation.confirmation.description}
        </p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href={`${APPLICATION_ROUTES.MODELS}/${modelId}`}
            title={MODELS_CONTENT.modelCreation.confirmation.buttons.goToModel}
            nativeAnchor={false}
          >
            <Button>
              {MODELS_CONTENT.modelCreation.confirmation.buttons.goToModel}
            </Button>
          </Link>
          <Link
            href={`${APPLICATION_ROUTES.MODELS}`}
            title={
              MODELS_CONTENT.modelCreation.confirmation.buttons.exploreModels
            }
          >
            <Button variant="dark">
              {MODELS_CONTENT.modelCreation.confirmation.buttons.exploreModels}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
