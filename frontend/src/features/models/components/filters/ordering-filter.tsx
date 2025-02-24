import { DropDown } from "@/components/ui/dropdown";
import { CheckboxGroup } from "@/components/ui/form";
import {
  MODELS_CONTENT,
  MODEL_LIST_FILTER_QUERY_PARAMS,
  ORDERING_FIELDS,
} from "@/constants";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { TQueryParams } from "@/types";

type OrderingFilterProps = {
  updateQuery: (params: TQueryParams) => void;
  query: TQueryParams;
  disabled?: boolean;
  isMobileFilterModal?: boolean;
};

const OrderingFilter: React.FC<OrderingFilterProps> = ({
  disabled = false,
  query,
  updateQuery,
  isMobileFilterModal = false,
}) => {
  const onSortSelect = (selectedItem: string) => {
    updateQuery({
      [MODEL_LIST_FILTER_QUERY_PARAMS.ordering]: ORDERING_FIELDS.find(
        (v) => v.value === selectedItem
      )?.apiValue as string,
    });
  };

  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();

  if (!isMobileFilterModal) {
    return (
      <div className="hidden md:block">
        <DropDown
          menuItems={ORDERING_FIELDS}
          dropdownIsOpened={dropdownIsOpened}
          onDropdownHide={onDropdownHide}
          onDropdownShow={onDropdownShow}
          handleMenuSelection={onSortSelect}
          disabled={disabled}
          withCheckbox
          defaultSelectedItem={
            ORDERING_FIELDS.find(
              (v) =>
                v.apiValue === query[MODEL_LIST_FILTER_QUERY_PARAMS.ordering]
            )?.value
          }
          triggerComponent={
            <p className="text-nowrap text-sm text-dark">
              {
                MODELS_CONTENT.models.modelsList.sortingAndPaginationSection
                  .sortingTitle
              }
            </p>
          }
        ></DropDown>
      </div>
    );
  }

  return (
    <CheckboxGroup
      options={ORDERING_FIELDS}
      disabled={disabled}
      // @ts-expect-error bad type definition
      onCheck={onSortSelect}
      defaultSelectedOption={
        ORDERING_FIELDS.find(
          (v) => v.apiValue === query[MODEL_LIST_FILTER_QUERY_PARAMS.ordering]
        )?.value
      }
    ></CheckboxGroup>
  );
};

export default OrderingFilter;
