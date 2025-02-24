import { TagsInfoIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import useScreenSize from "@/hooks/use-screen-size";

export const ModelDetailsButton = ({
  popupAnchorId,
  onClick,
  modelDetailsPopupIsActive = false,
}: {
  popupAnchorId?: string;
  onClick: () => void;
  modelDetailsPopupIsActive?: boolean;
}) => {
  const { isSmallViewport } = useScreenSize();
  return (
    <ToolTip
      content={
        !isSmallViewport
          ? START_MAPPING_PAGE_CONTENT.modelDetails.tooltip
          : null
      }
    >
      <button
        id={popupAnchorId}
        className={`hover:icon-interaction flex items-center p-1.5 text-body-2 text-gray ${modelDetailsPopupIsActive && "icon-interaction"}`}
        onClick={onClick}
      >
        <TagsInfoIcon className="icon" />
      </button>
    </ToolTip>
  );
};
