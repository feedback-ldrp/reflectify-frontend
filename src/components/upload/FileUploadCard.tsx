// src/components/upload/FileUploadCard.tsx

"use client";

import React from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { FileUploadRoute } from "@/interfaces/upload";
import { Button } from "../ui";

interface FileUploadCardProps {
  fileKey: string;
  routeConfig: FileUploadRoute;
  file: File | null;
  isLoading: boolean;
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileKey: string,
  ) => void;
  onClearFile: (fileKey: string) => void;
  onPreview: (fileKey: string) => Promise<void>;
  onSubmitUpload: (fileKey: string) => Promise<void>;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  fileKey,
  routeConfig,
  file,
  isLoading,
  onFileChange,
  onClearFile,
  onPreview,
  onSubmitUpload,
}) => {
  const { label, icon, referenceFileUrl, description } = routeConfig;
  const canSubmit = file && isLoading === false;

  return (
    <Card className="bg-light-background dark:bg-dark-muted-background shadow-sm border border-light-secondary dark:border-dark-secondary p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-light-secondary dark:bg-dark-secondary rounded-xl">
              {icon &&
                React.createElement(icon, {
                  className:
                    "h-6 w-6 text-light-highlight dark:text-dark-highlight",
                })}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
                {label}
              </h2>
              {description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Reference File Download Button */}
          {referenceFileUrl && (
            <Button
              onClick={() => window.open(referenceFileUrl, "_blank")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-lg hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
              title="Download reference file"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              File Format
            </Button>
          )}
        </div>

        <input
          name={fileKey}
          type="file"
          accept=".xlsx,.xls"
          title={`Upload ${label} Excel file`}
          placeholder={`Choose ${label} Excel file`}
          onChange={(e) => onFileChange(e, fileKey)}
          className="block w-full text-sm text-light-muted-text dark:text-dark-muted-text
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-light-secondary file:dark:bg-dark-secondary file:text-light-highlight file:dark:text-dark-highlight
                        transition-all cursor-pointer
                        hover:file:bg-light-hover hover:dark:file:bg-dark-hover"
        />

        {file && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-dark font-medium flex items-center gap-2 truncate max-w-[60%]">
              <span className="w-2 h-2 bg-light-highlight dark:bg-dark-highlight rounded-full flex-shrink-0"></span>
              <span className="truncate">{file.name}</span>
            </p>
            <button
              onClick={() => onClearFile(fileKey)}
              className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full transition-colors flex-shrink-0"
              title="Clear file"
              aria-label="Clear file"
            >
              <XMarkIcon className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onPreview(fileKey)}
            disabled={!file}
            className="flex-1 bg-transparent border-2 border-primary-main text-light-highlight dark:text-dark-highlight py-2.5 px-4 rounded-xl
                            hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>
          <button
            onClick={() => onSubmitUpload(fileKey)}
            disabled={!canSubmit || isLoading}
            className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                            hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                Processing
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
