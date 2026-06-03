"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadedFileName: string | null;
  totalChunks: number | null;
}

export function UploadZone({
  onUpload,
  isUploading,
  uploadedFileName,
  totalChunks,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setLocalError("Please choose a PDF file.");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setLocalError("File must be under 15 MB.");
        return;
      }

      await onUpload(file);
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      void handleFile(event.dataTransfer.files[0]);
    },
    [handleFile],
  );

  if (uploadedFileName && totalChunks !== null) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PdfIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-stone-900">
              {uploadedFileName}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              Indexed · {totalChunks} text {totalChunks === 1 ? "chunk" : "chunks"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 transition hover:border-stone-300 hover:bg-stone-100 disabled:opacity-50"
        >
          {isUploading ? "Processing…" : "Replace document"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={[
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition",
          isDragging
            ? "border-amber-500 bg-amber-50/60"
            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80",
          isUploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          {isUploading ? <Spinner /> : <UploadIcon />}
        </div>
        <p className="text-sm font-medium text-stone-800">
          {isUploading ? "Reading and indexing your PDF…" : "Drop your PDF here"}
        </p>
        <p className="mt-1 text-xs text-stone-500">
          or click to browse · max 15 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {localError && (
        <p className="mt-2 text-xs text-red-600">{localError}</p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M10 13h4M10 17h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M12 3a9 9 0 019 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
