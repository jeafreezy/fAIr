import { SlChangeEvent } from "node_modules/@shoelace-style/shoelace/dist/events/sl-change";

import { SlSwitch } from "@shoelace-style/shoelace/dist/react";

import { cn } from "@/utils";

import styles from "./switch.module.css";

type SwitchProps = {
  disabled?: boolean;
  handleSwitchChange: (args: SlChangeEvent) => void;
  checked: boolean;
};
const Switch: React.FC<SwitchProps> = ({
  checked,
  disabled,
  handleSwitchChange,
}) => {
  return (
    <SlSwitch
      checked={checked}
      disabled={disabled}
      onSlChange={handleSwitchChange}
      className={cn(`${styles.customSwitch} ${checked && styles.checked}`)}
    ></SlSwitch>
  );
};

export default Switch;
