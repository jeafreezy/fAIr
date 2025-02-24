import { useCallback, useEffect, useState } from "react";

import {
  SlFormatBytes,
  SlTree,
  SlTreeItem,
} from "@shoelace-style/shoelace/dist/react";
import { useQueryClient } from "@tanstack/react-query";

import { DirectoryIcon, FileIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { MODELS_CONTENT, TOAST_NOTIFICATIONS } from "@/constants";
import { getTrainingWorkspaceQueryOptions } from "@/features/models/api/factory";
import { API_ENDPOINTS, apiClient } from "@/services";
import { TCSSWithVars } from "@/types";
import { showErrorToast, showSuccessToast, truncateString } from "@/utils";

type DirectoryTreeProps = {
  datasetId: number;
  trainingId: number;
  isOpened: boolean;
};

type DirectoryTreeItems = {
  dir: Record<string, DirectoryTreeItems & { size: number; length: number }>;
  file: Record<string, { size: number; length: number }>;
};

const DirectoryLoadingSkeleton = () => (
  <ul className="flex flex-col gap-y-4">
    {new Array(5).fill(null).map((_, id) => (
      <li
        key={`model-file-${id}`}
        className="flex h-10 w-full items-center gap-x-4"
      >
        <div className="h-10 w-[10%] animate-pulse bg-light-gray"></div>
        <div className="h-6 w-3/5 animate-pulse bg-light-gray"></div>
      </li>
    ))}
  </ul>
);

const FileItem = ({
  keyName,
  size,
  onDownload,
  isDownloading,
}: {
  keyName: string;
  size: number;
  onDownload: () => void;
  isDownloading: boolean;
}) => (
  <div className="flex items-center gap-x-2" onClick={onDownload}>
    <FileIcon className="size-4" />
    <div className="flex flex-col gap-x-2 md:flex-row">
      <span title={keyName} className="text-nowrap text-body-2base text-dark">
        {truncateString(keyName)}
      </span>
      <span className="flex items-center gap-x-2 text-nowrap text-body-3 text-gray">
        <SlFormatBytes value={size} />
        {isDownloading && <Spinner />}
      </span>
    </div>
  </div>
);

const DirectoryItem = ({
  keyName,
  size,
  length,
  children,
}: {
  keyName: string;
  size: number;
  length: number;
  children: React.ReactNode;
}) => (
  <>
    <div className="flex items-center gap-x-2">
      <DirectoryIcon className="size-4" />
      <div className="flex flex-col gap-x-2 md:flex-row">
        <span title={keyName} className="text-nowrap text-body-2base text-dark">
          {truncateString(keyName)}
        </span>
        <div className="flex gap-x-2">
          <span className="text-nowrap text-body-3 text-gray">
            <SlFormatBytes value={size} />
          </span>
          <span className="text-nowrap text-body-3 text-gray">
            {length} items
          </span>
        </div>
      </div>
    </div>
    {children}
  </>
);

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  datasetId,
  trainingId,
}) => {
  const [directoryTree, setDirectoryTree] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const queryClient = useQueryClient();
  const [downLoadingFilePath, setDownLoadingFilePath] = useState<string>("");

  const fetchDirectoryData = useCallback(
    async (path: string = "") => {
      try {
        if (trainingId !== null) {
          return await queryClient.fetchQuery({
            ...getTrainingWorkspaceQueryOptions(trainingId, path),
          });
        }
      } catch {
        setHasError(true);
        return null;
      }
    },
    [queryClient, trainingId]
  );

  const fetchDirectoryRecursive = useCallback(
    async (
      currentDirectory: string = "",
      currentDepth: number = 0,
      maxDepth: number = 2
    ): Promise<unknown> => {
      if (currentDepth >= maxDepth) {
        return {};
      }

      const data = await fetchDirectoryData(currentDirectory);
      if (!data) return {};

      const { dir, file } = data;

      const subdirectories =
        dir && currentDepth < maxDepth
          ? await Promise.all(
              Object.keys(dir).map(async (key: string) => {
                const fullPath = currentDirectory
                  ? `${currentDirectory}/${key}/`
                  : key;
                const subDirData = await fetchDirectoryRecursive(
                  fullPath,
                  currentDepth + 1,
                  maxDepth
                );
                return {
                  [key]: {
                    ...(typeof subDirData === "object" ? subDirData : {}),
                    size: dir[key]?.size || 0,
                    length: dir[key]?.len || 0,
                  },
                };
              })
            )
          : [];

      return {
        dir: Object.assign({}, ...subdirectories),
        file: file || {},
      };
    },
    [fetchDirectoryData]
  );

  useEffect(() => {
    const fetchAllDirectories = async () => {
      try {
        setIsLoading(true);
        const rootData = await fetchDirectoryRecursive("");
        setDirectoryTree(rootData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDirectories();
  }, [datasetId, trainingId, fetchDirectoryRecursive]);

  const handleFileDownload = async (validPath: string) => {
    try {
      setDownLoadingFilePath(validPath);
      const response = await apiClient.get(
        API_ENDPOINTS.DOWNLOAD_TRAINING_FILE(trainingId, validPath),
        {
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        showErrorToast(TOAST_NOTIFICATIONS.fileDownloadFailed);
        return;
      }

      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      //@ts-expect-error bad type definition
      a.download = validPath.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccessToast(TOAST_NOTIFICATIONS.fileDownloadSuccess);
    } catch {
      showErrorToast(TOAST_NOTIFICATIONS.fileDownloadFailed);
    } finally {
      setDownLoadingFilePath("");
    }
  };

  const renderTreeItems = (
    items: DirectoryTreeItems,
    parentKey: string = ""
  ) => {
    const combinedItems = {
      ...items.dir,
      ...items.file,
    };

    return Object.entries(combinedItems).map(([key, value]) => {
      const isDirectory =
        Object.prototype.hasOwnProperty.call(value, "dir") ||
        Object.prototype.hasOwnProperty.call(value, "length");
      const currentPath = parentKey ? `${parentKey}/${key}` : key;
      return (
        <SlTreeItem key={currentPath}>
          {isDirectory ? (
            <DirectoryItem
              keyName={key}
              size={value.size}
              length={value.length}
            >
              {renderTreeItems(value, currentPath)}
            </DirectoryItem>
          ) : (
            <FileItem
              keyName={key}
              size={value.size}
              onDownload={() => handleFileDownload(currentPath)}
              isDownloading={downLoadingFilePath === currentPath}
            />
          )}
        </SlTreeItem>
      );
    });
  };

  if (isLoading) return <DirectoryLoadingSkeleton />;
  if (hasError)
    return (
      <div>
        {MODELS_CONTENT.models.modelsDetailsCard.modelFilesDialog.error}
      </div>
    );

  return (
    <SlTree style={{ "--indent-guide-width": "1px" } as TCSSWithVars}>
      <SlTreeItem key="root">
        <DirectoryIcon className="mr-2 size-4" />
        <span>
          {
            MODELS_CONTENT.models.modelsDetailsCard.modelFilesDialog
              .rootDirectory
          }
        </span>
        {directoryTree && renderTreeItems(directoryTree)}
      </SlTreeItem>
    </SlTree>
  );
};

export default DirectoryTree;
