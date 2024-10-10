import { IconProps } from "@/types";
import React from "react";

const RequestIcon: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1.5V3.5H15.5V1.5H12ZM10.5 1.25C10.5 0.559644 11.0596 0 11.75 0H15.75C16.4404 0 17 0.559644 17 1.25V3.75C17 4.44036 16.4404 5 15.75 5H11.75C11.0596 5 10.5 4.44036 10.5 3.75V1.25ZM13.2197 6.71967C13.5126 6.42678 13.9874 6.42678 14.2803 6.71967L16.7803 9.21967C17.0732 9.51256 17.0732 9.98744 16.7803 10.2803C16.4874 10.5732 16.0126 10.5732 15.7197 10.2803L14.5 9.06066V15.75C14.5 16.1642 14.1642 16.5 13.75 16.5C13.3358 16.5 13 16.1642 13 15.75V9.06066L11.7803 10.2803C11.4874 10.5732 11.0126 10.5732 10.7197 10.2803C10.4268 9.98744 10.4268 9.51256 10.7197 9.21967L13.2197 6.71967ZM4.5 13V15H8V13H4.5ZM3 12.75C3 12.0596 3.55964 11.5 4.25 11.5H8.25C8.94036 11.5 9.5 12.0596 9.5 12.75V15.25C9.5 15.9404 8.94036 16.5 8.25 16.5H4.25C3.55964 16.5 3 15.9404 3 15.25V12.75ZM0.75 14C1.16421 14 1.5 14.3358 1.5 14.75V16.75C1.5 17.4404 2.05964 18 2.75 18H17.25C17.9404 18 18.5 17.4404 18.5 16.75V14.75C18.5 14.3358 18.8358 14 19.25 14C19.6642 14 20 14.3358 20 14.75V16.75C20 18.2688 18.7688 19.5 17.25 19.5H2.75C1.23122 19.5 0 18.2688 0 16.75V14.75C0 14.3358 0.335786 14 0.75 14Z" fill="currentColor" />
    </svg>
);

export default RequestIcon;



