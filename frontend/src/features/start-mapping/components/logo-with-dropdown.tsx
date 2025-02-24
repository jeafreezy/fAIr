import { useNavigate } from "react-router-dom";

import { NavLogo } from "@/components/layout";
import { Divider } from "@/components/ui/divider";
import { DropDown } from "@/components/ui/dropdown";
import { Link } from "@/components/ui/link";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { navLinks } from "@/constants/general";
import { DropdownPlacement } from "@/enums";

type BrandLogoWithDropDownProps = {
  isOpened: boolean;
  onClose: () => void;
  onShow: () => void;
};

export const BrandLogoWithDropDown = function BrandLogoWithDropDown({
  isOpened,
  onClose,
  onShow,
}: BrandLogoWithDropDownProps) {
  const navItems = navLinks.map((link, id) => (
    <li key={`${link.title}-${id}`}>
      <Link
        disableLinkStyle
        title={link.title}
        href={link.href}
        className={`block text-nowrap px-4 py-2 text-body-3 text-dark hover:bg-off-white  ${id === 0 ? "hover:rounded-t-xl" : ""}`}
        nativeAnchor={false}
      >
        {link.title}
      </Link>
    </li>
  ));

  const navigate = useNavigate();
  return (
    <DropDown
      placement={DropdownPlacement.BOTTOM_START}
      dropdownIsOpened={isOpened}
      onDropdownHide={onClose}
      onDropdownShow={onShow}
      triggerComponent={<NavLogo onClick={() => null} smallerSize />}
      distance={ELEMENT_DISTANCE_FROM_NAVBAR}
      className="rounded-xl"
    >
      <div className="flex w-full flex-col rounded-xl bg-white">
        <ul className="flex flex-col">{navItems}</ul>
        <Divider />
        <button
          className="block  w-full px-4 py-2 text-start text-body-3 text-primary hover:rounded-b-xl hover:bg-off-white"
          onClick={() => navigate(-1)}
        >
          Stop Mapping
        </button>
      </div>
    </DropDown>
  );
};
