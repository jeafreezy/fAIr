import { IconProps } from "@/types";
import React from "react";

const SortIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.24686 0.96652C4.07601 0.795665 3.799 0.795665 3.62814 0.96652L1.00314 3.59152C0.832286 3.76237 0.832286 4.03938 1.00314 4.21024C1.174 4.38109 1.451 4.38109 1.62186 4.21024L3.5 2.3321V10.9009C3.5 11.1425 3.69588 11.3384 3.9375 11.3384C4.17912 11.3384 4.375 11.1425 4.375 10.9009V2.3321L6.25314 4.21024C6.424 4.38109 6.70101 4.38109 6.87186 4.21024C7.04271 4.03938 7.04271 3.76237 6.87186 3.59152L4.24686 0.96652ZM9.75842 11.2154C9.928 11.3794 10.197 11.3794 10.3666 11.2154L12.9916 8.67785C13.1653 8.50991 13.17 8.23294 13.0021 8.05922C12.8341 7.88549 12.5571 7.8808 12.3834 8.04874L10.5 9.86944L10.5 1.27596C10.5 1.03434 10.3041 0.838463 10.0625 0.838463C9.82088 0.838463 9.625 1.03434 9.625 1.27596L9.625 9.86944L7.74158 8.04874C7.56786 7.8808 7.29089 7.88549 7.12295 8.05922C6.95501 8.23294 6.9597 8.50991 7.13342 8.67785L9.75842 11.2154Z"
      fill="currentColor"
    />
  </svg>
);

export default SortIcon;