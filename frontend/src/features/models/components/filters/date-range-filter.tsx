/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { SlCheckbox } from "@shoelace-style/shoelace/dist/react";

import { DropDown } from "@/components/ui/dropdown";
import { DateRangePicker } from "@/components/ui/form";
import {
  MODELS_LIST_DATE_FILTERS,
  MODEL_LIST_FILTER_QUERY_PARAMS,
} from "@/constants";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { TQueryParams } from "@/types";

type DateRangeFilterProps = {
  disabled: boolean;
  updateQuery: (newParams: TQueryParams) => void;
  query: TQueryParams;
  isMobileFilterModal?: boolean;
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  disabled,
  query,
  updateQuery,
  isMobileFilterModal = false,
}) => {
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();

  const [startDate, setStartDate] = useState<string>(
    query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] as string
  );
  const [endDate, setEndDate] = useState<string>(
    query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate] as string
  );
  const [triggerText, setTriggerText] = useState<string>("Date");

  const onApply = () => {
    updateQuery({
      [MODEL_LIST_FILTER_QUERY_PARAMS.startDate]: startDate,
      [MODEL_LIST_FILTER_QUERY_PARAMS.endDate]: endDate,
    });
    setTriggerText(
      startDate && endDate
        ? `${startDate} - ${endDate}`
        : startDate
          ? `${startDate} - Today`
          : endDate
            ? `Start - ${endDate}`
            : "Date"
    );
    onDropdownHide();
  };

  useEffect(() => {
    setStartDate(
      (query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] as string) || ""
    );
    setEndDate((query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate] as string) || "");
    setTriggerText(
      query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] ||
        query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate]
        ? `${query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate] || "Start"} - ${query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate] || "Today"}`
        : "Date"
    );
  }, [
    query[MODEL_LIST_FILTER_QUERY_PARAMS.startDate],
    query[MODEL_LIST_FILTER_QUERY_PARAMS.endDate],
  ]);

  const onClear = () => {
    setStartDate("");
    setEndDate("");
    updateQuery({
      [MODEL_LIST_FILTER_QUERY_PARAMS.startDate]: "",
      [MODEL_LIST_FILTER_QUERY_PARAMS.endDate]: "",
    });
  };

  if (!isMobileFilterModal) {
    return (
      <div className="hidden border border-gray-border px-4 py-2 md:block">
        <DropDown
          dropdownIsOpened={dropdownIsOpened}
          onDropdownHide={onDropdownHide}
          onDropdownShow={onDropdownShow}
          disabled={disabled}
          triggerComponent={
            <p className="text-nowrap text-sm text-dark">{triggerText}</p>
          }
        >
          <div className="flex w-full flex-col gap-y-4 bg-white p-4">
            {/* The user can only select one at a time*/}
            <div className="flex w-full items-center justify-start gap-x-6">
              {MODELS_LIST_DATE_FILTERS.map((datefilter, id) => (
                <SlCheckbox
                  key={`date-filter-${id}`}
                  size="small"
                  checked={
                    query[MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter] ===
                    datefilter.searchParams
                  }
                  onSlChange={() =>
                    updateQuery({
                      [MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter]:
                        datefilter.searchParams,
                    })
                  }
                >
                  {datefilter.label}
                </SlCheckbox>
              ))}
            </div>

            <DateRangePicker
              onStartDateChange={(e) => setStartDate(e.target.value)}
              onEndDateChange={(e) => setEndDate(e.target.value)}
              startDate={startDate}
              endDate={endDate}
              onClear={onClear}
              onApply={onApply}
            />
          </div>
        </DropDown>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-y-4 bg-white">
      <div className="flex w-full items-center gap-x-4">
        {MODELS_LIST_DATE_FILTERS.map((datefilter, id) => (
          <SlCheckbox
            key={`date-filter-${id}`}
            size="small"
            checked={
              query[MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter] ===
              datefilter.searchParams
            }
            onSlChange={() =>
              updateQuery({
                [MODEL_LIST_FILTER_QUERY_PARAMS.dateFilter]:
                  datefilter.searchParams,
              })
            }
          >
            {datefilter.label}
          </SlCheckbox>
        ))}
      </div>
      <DateRangePicker
        onStartDateChange={(e) => setStartDate(e.target.value)}
        onEndDateChange={(e) => setEndDate(e.target.value)}
        startDate={startDate}
        endDate={endDate}
        onClear={onClear}
        onApply={onApply}
        isMobileFilterModal
      />
    </div>
  );
};

export default DateRangeFilter;
