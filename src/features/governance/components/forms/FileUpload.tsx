import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { UseFormSetValue, UseFormUnregister } from "react-hook-form";

import { trash, upload } from "@/features/core/lib/icons";

interface FileUploadProps {
  error?: string;
  id: string;
  label?: string;
  setUploadedFile: (file: File | null) => void;
  setValue: UseFormSetValue<any>;
  unregister: UseFormUnregister<any>;
  uploadedFile: File | null;
}

export const FileUpload = ({
  error,
  id,
  setUploadedFile,
  setValue,
  unregister,
  uploadedFile,
}: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.[0]) {
        setUploadedFile(acceptedFiles[0]);
        setValue(id, acceptedFiles[0]);
      }
    },
    [id, setUploadedFile, setValue],
  );

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setUploadedFile(null);
      unregister(id);
      setValue(id, null);
    },
    [id, setUploadedFile, unregister, setValue],
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "application/wasm": [".wasm"],
    },
    maxFiles: 1,
    noClick: uploadedFile !== null,
    noKeyboard: uploadedFile !== null,
    onDrop,
  });

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col">
        <label
          className="font-['Akkurat LL'] text-xs font-bold uppercase leading-[14px] tracking-wide text-[#949494]"
          htmlFor={id}
        >
          WASM Binary File Upload
        </label>

        <div
          {...getRootProps()}
          className={`mt-[26px] flex flex-col ${uploadedFile ? "pointer-events-none" : ""}`}
        >
          <input className="hidden" {...getInputProps()} />
          <div
            className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white/10 transition-colors ${!uploadedFile && !isDragActive ? "hover:bg-white/20" : ""}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <span dangerouslySetInnerHTML={{ __html: upload }} />
            </div>
            <div className="mt-8 flex items-center space-x-1">
              <span className="font-['Akkurat LL'] text-base font-normal leading-normal text-white">
                Browse
              </span>
              <span className="font-['Akkurat LL'] text-base font-normal leading-normal text-[#949494]">
                or drag files here
              </span>
            </div>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-4 flex h-20 w-full items-center justify-between rounded-lg border border-white border-opacity-20">
            <div className="flex items-center">
              <div className="ml-4 h-12 w-12 rounded-lg bg-white bg-opacity-10" />
              <div className="ml-[27px] flex flex-col">
                <span className="font-['Akkurat LL'] text-sm font-bold leading-tight text-white">
                  {uploadedFile.name}
                </span>
                <span className="font-['Akkurat LL'] mt-2 text-xs font-normal leading-tight text-[#949494]">
                  {(uploadedFile.size / 1024).toFixed(0)}KB
                </span>
              </div>
            </div>
            <button
              className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
              onClick={handleRemoveFile}
              type="button"
            >
              <span dangerouslySetInnerHTML={{ __html: trash }} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};
