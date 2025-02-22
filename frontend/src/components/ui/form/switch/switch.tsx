import { SlSwitch } from "@shoelace-style/shoelace/dist/react";

import { cn } from "@/utils";

import styles from "./switch.module.css";

type SwitchProps = {
  disabled?: boolean;
  handleSwitchChange: (args: any) => void;
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
