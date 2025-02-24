import { TQueryParams } from "@/app/routes/start-mapping";
import { DropDown } from "@/components/ui/dropdown";
import { FormLabel, Input, Select, Switch } from "@/components/ui/form";
import { SettingsIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import {
  MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS,
  START_MAPPING_PAGE_CONTENT,
} from "@/constants";
import {
  DropdownPlacement,
  INPUT_TYPES,
  SHOELACE_SELECT_SIZES,
  SHOELACE_SIZES,
} from "@/enums";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";

const confidenceLevels = [
  {
    name: "25%",
    value: 25,
  },
  {
    name: "50%",
    value: 50,
  },
  {
    name: "75%",
    value: 75,
  },
  {
    name: "90%",
    value: 90,
  },
];

export const ModelSettings = ({
  query,
  updateQuery,
  isMobile = false,
}: {
  query: TQueryParams;
  updateQuery: (newParams: TQueryParams) => void;
  isMobile?: boolean;
}) => {
  const {
    onDropdownHide: onModelSettingsDropdownHide,
    onDropdownShow: onModelSettingsDropdownShow,
    dropdownIsOpened,
    toggleDropDown,
  } = useDropdownMenu();

  const handleQueryUpdate = (key: string, val: number | boolean) => {
    // Keep the dropdown opened when making changes
    onModelSettingsDropdownShow();
    updateQuery({
      [key]: val,
    });
  };

  const modelSettings = (
    <div className="flex flex-col flex-wrap justify-between gap-y-4 rounded-xl bg-white p-3">
      <div className="flex justify-between gap-x-2">
        <FormLabel
          label={START_MAPPING_PAGE_CONTENT.settings.useJOSMQ.label}
          withTooltip
          toolTipContent={START_MAPPING_PAGE_CONTENT.settings.useJOSMQ.tooltip}
          position="left"
        />
        <Switch
          checked={
            query[MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.useJOSMQ] as boolean
          }
          handleSwitchChange={(event) => {
            handleQueryUpdate(
              MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.useJOSMQ,
              event.target.checked
            );
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-x-4">
        <FormLabel
          label={START_MAPPING_PAGE_CONTENT.settings.confidence.label}
          withTooltip
          toolTipContent={
            START_MAPPING_PAGE_CONTENT.settings.confidence.tooltip
          }
          position="left"
        />
        <Select
          className="w-[80px]"
          size={SHOELACE_SELECT_SIZES.SMALL}
          options={confidenceLevels}
          defaultValue={
            query[
              MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.confidenceLevel
            ] as number
          }
          handleChange={(value) => {
            handleQueryUpdate(
              MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.confidenceLevel,
              Number(value)
            );
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-x-2">
        <FormLabel
          label={START_MAPPING_PAGE_CONTENT.settings.tolerance.label}
          withTooltip
          toolTipContent={START_MAPPING_PAGE_CONTENT.settings.tolerance.tooltip}
          position="left"
        />
        <Input
          className="w-16"
          size={SHOELACE_SIZES.SMALL}
          value={
            query[MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.tolerance] as number
          }
          labelWithTooltip
          type={INPUT_TYPES.NUMBER}
          showBorder
          handleInput={(event) =>
            handleQueryUpdate(
              MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.tolerance,
              Number(event.target.value)
            )
          }
          min={0}
          step={0.1}
        />
      </div>
      <div className="flex items-center  justify-between gap-x-2">
        <FormLabel
          label={START_MAPPING_PAGE_CONTENT.settings.area.label}
          withTooltip
          toolTipContent={START_MAPPING_PAGE_CONTENT.settings.area.tooltip}
          position="left"
        />
        <Input
          className="w-16"
          size={SHOELACE_SIZES.SMALL}
          value={query[MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.area] as number}
          labelWithTooltip
          type={INPUT_TYPES.NUMBER}
          showBorder
          handleInput={(event) =>
            handleQueryUpdate(
              MODEL_PREDICTIONS_SETTINGS_QUERY_PARAMS.area,
              Number(event.target.value)
            )
          }
          min={0}
        />
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <DropDown
        placement={DropdownPlacement.TOP_END}
        distance={ELEMENT_DISTANCE_FROM_NAVBAR}
        disableCheveronIcon
        dropdownIsOpened={dropdownIsOpened}
        onDropdownHide={onModelSettingsDropdownHide}
        onDropdownShow={onModelSettingsDropdownShow}
        triggerComponent={
          <ToolTip content={START_MAPPING_PAGE_CONTENT.settings.tooltip}>
            <button
              className={`hover:icon-interaction flex items-center p-1.5 ${dropdownIsOpened && "icon-interaction"}`}
              onClick={toggleDropDown}
            >
              <SettingsIcon className="icon md:icon-lg text-dark" />
            </button>
          </ToolTip>
        }
        className="rounded-xl"
      >
        {modelSettings}
      </DropDown>
    );
  }
  return modelSettings;
};
