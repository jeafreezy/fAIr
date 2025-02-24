import { useNavigate } from "react-router-dom";

import { ButtonWithIcon } from "@/components/ui/button";
import { AddIcon } from "@/components/ui/icons";
import { APPLICATION_ROUTES, MODELS_CONTENT } from "@/constants";

const PageHeader = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(APPLICATION_ROUTES.CREATE_NEW_MODEL);
  };

  return (
    <div className="my-12 flex flex-col gap-y-8">
      <div>
        <h1 className="text-title-1 font-semibold text-primary md:text-large-title">
          {title ?? MODELS_CONTENT.models.modelsList.pageTitle}
        </h1>
      </div>
      <div className="flex flex-col justify-between gap-y-6 md:flex-row">
        <p className="max-w-[80%] text-body-2base text-gray md:max-w-[50%] md:text-body-2">
          {description ?? MODELS_CONTENT.models.modelsList.description}
        </p>
        <div className="self-start">
          <ButtonWithIcon
            onClick={handleClick}
            variant="primary"
            prefixIcon={AddIcon}
            label={MODELS_CONTENT.models.modelsList.ctaButton}
          />
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
