import { useNavigate } from "react-router-dom";

import { BrandLogo } from "@/assets/svgs";
import { Image } from "@/components/ui/image";
import { APPLICATION_ROUTES, SHARED_CONTENT } from "@/constants";

export const NavLogo = ({
  onClick,
  smallerSize,
}: {
  onClick?: () => void;
  smallerSize?: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(APPLICATION_ROUTES.HOMEPAGE);
    }
  };

  const width = smallerSize ? "50px" : "60px";
  const height = smallerSize ? "50px" : "22px";

  return (
    <button
      onClick={handleClick}
      title={SHARED_CONTENT.navbar.logoAlt}
      className="flex items-center gap-x-1"
    >
      <Image
        src={BrandLogo}
        alt={SHARED_CONTENT.navbar.logoAlt}
        width={width}
        height={height}
      />
      <p className="text-body-2 font-semibold">fAIr</p>
    </button>
  );
};
