import { CategoryIcon, ListIcon } from "@/components/ui/icons";
import { MODEL_LIST_FILTER_QUERY_PARAMS } from "@/constants";
import { LayoutView } from "@/enums";
import { useScrollToTop } from "@/hooks/use-scroll-to-element";
import { TQueryParams } from "@/types";

const LayoutToggle = ({
  query,
  updateQuery,
  isMobile,
  disabled = false,
}: {
  updateQuery: (params: TQueryParams) => void;
  query: TQueryParams;
  isMobile?: boolean;
  disabled?: boolean;
}) => {
  const activeLayout = query[MODEL_LIST_FILTER_QUERY_PARAMS.layout];
  const { scrollToTop } = useScrollToTop();
  return (
    <button
      title={`Switch to ${query[MODEL_LIST_FILTER_QUERY_PARAMS.layout] === LayoutView.GRID ? LayoutView.LIST : (LayoutView.GRID as string)} layout`}
      className={`${isMobile ? "flex md:hidden" : "hidden md:flex"} cursor-pointer items-center justify-center border border-gray-border p-2 text-dark`}
      onClick={() => {
        updateQuery({
          [MODEL_LIST_FILTER_QUERY_PARAMS.layout]:
            activeLayout === LayoutView.GRID
              ? LayoutView.LIST
              : LayoutView.GRID,
        });
        scrollToTop();
      }}
      disabled={disabled}
    >
      {activeLayout !== LayoutView.LIST ? (
        <ListIcon className="icon-lg" />
      ) : (
        <CategoryIcon className="icon-lg" />
      )}
    </button>
  );
};

export default LayoutToggle;
