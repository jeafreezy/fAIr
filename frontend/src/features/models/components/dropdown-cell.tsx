import { Badge } from "@/components/ui/badge";
import { DropDown } from "@/components/ui/dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown/dropdown";
import { ElipsisIcon } from "@/components/ui/icons";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";

export const CellWithDropDown = ({
  menuItems,
}: {
  menuItems: DropdownMenuItem[];
}) => {
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();
  return (
    <DropDown
      disableCheveronIcon
      dropdownIsOpened={dropdownIsOpened}
      onDropdownHide={onDropdownHide}
      onDropdownShow={onDropdownShow}
      triggerComponent={
        <Badge
          variant="default"
          onClick={() => null}
          className="flex items-center rounded-lg px-2"
        >
          <ElipsisIcon className="icon" />
        </Badge>
      }
      className="text-right"
      distance={10}
      menuItems={menuItems}
    ></DropDown>
  );
};
