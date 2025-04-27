import useCopyToClipboard from "@/hooks/use-clipboard";
import { CheckIcon, ClipboardIcon } from "@/components/ui/icons";

export const CopyButton = ({
    text,
    size = "large",
}: {
    text: string;
    size?: "small" | "large";
}) => {
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const iconSize = size === "small" ? "icon" : "icon md:icon-lg";

    return (
        <button
            onClick={() => copyToClipboard(text)}
            className={`relative bg-red-300 ${iconSize} w-full h-full flex items-center justify-center`}
        >
            <ClipboardIcon
                className={`absolute inset-0 ${iconSize} transition-all duration-300 ${isCopied ? "opacity-0" : "opacity-100"
                    }`}
            />
            <CheckIcon
                className={`absolute inset-0 ${iconSize} transition-all duration-300 ${isCopied ? "opacity-100" : "opacity-0"
                    }`}
            />
        </button>
    );
};
