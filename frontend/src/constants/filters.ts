import { DropdownMenuItem } from "@/components/ui/dropdown/dropdown";
import { DateFilter } from "@/types";

// Search parameters for models page filtering
export const MODEL_LIST_FILTER_QUERY_PARAMS = {
  startDate: "start_date",
  endDate: "end_date",
  mapIsActive: "map",
  ordering: "orderBy",
  searchQuery: "q",
  offset: "offset",
  dateFilter: "dateFilter",
  layout: "layout",
  id: "id",
  status: "status",
};

// Date filters for models page
export const MODELS_LIST_DATE_FILTERS: DateFilter[] = [
  {
    label: "Date Created",
    apiValue: "created_at",
    searchParams: "dateCreated",
  },
  {
    label: "Last Modified",
    apiValue: "last_modified",
    searchParams: "lastModified",
  },
];

// Search parameters for model predictions settings
export const MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS = {
  useJOSMQ: "useJOSMQ",
  confidenceLevel: "confidenceLevel",
  tolerance: "tolerance",
  area: "area",
};

export const ORDERING_FIELDS: DropdownMenuItem[] = [
  {
    value: "Oldest Created",
    apiValue: "created_at", // The actual filter from the backend. This is what is used to update the search params.
  },
  {
    value: "Newest Created",
    apiValue: "-created_at",
  },
  {
    value: "Oldest Updated",
    apiValue: "last_modified",
  },
  {
    value: "Newest Updated",
    apiValue: "-last_modified",
  },
];
