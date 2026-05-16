import { useState, useRef, useCallback } from 'react';
import { useDatasetProcessor } from '@/hooks/useDatasetProcessor';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

export function Dropzone() {
  const { processFile, cancelProcessing, status, progressMessage } = useDatasetProcessor();
  const storeError = useAppStore((s) => s.error);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string } | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file) {
          setErrorDetails(null);
          processFile(file).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Processing failed';
            setErrorDetails({ message: msg });
          });
        }
      }
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file) {
          setErrorDetails(null);
          processFile(file).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Processing failed';
            setErrorDetails({ message: msg });
          });
        }
      }
    },
    [processFile],
  );

  const handleClick = () => {
    if (status === 'processing') return;
    fileInputRef.current?.click();
  };

  const clearError = useAppStore((s) => s.clearDataset);

  const handleRetry = () => {
    setErrorDetails(null);
    clearError();
    cancelProcessing();
  };

  if (status === 'error' || errorDetails) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="w-full max-w-md rounded-2xl border border-[#3a1545] bg-[#0f1219] p-8 text-center shadow-[0_0_40px_rgba(244,63,94,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a0f14] ring-1 ring-[#f43f5e]/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-[#f43f5e] mb-2">Import Failed</h3>
          <p className="text-sm text-[#8899bb] mb-6">
            {errorDetails?.message || storeError?.message || 'An unexpected error occurred while processing your file.'}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a0f14] border border-[#f43f5e]/30 px-5 py-2.5 text-sm font-medium text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="w-full max-w-md rounded-2xl border border-[#1c2d4f] bg-[#0f1219] p-8 text-center shadow-[0_0_40px_rgba(0,212,255,0.05)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <svg
              className="animate-spin h-10 w-10 text-[#00d4ff]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#f0f4ff] mb-2">Processing Your Data</h3>
          <p className="text-sm text-[#8899bb] mb-4">{progressMessage || 'Parsing events...'}</p>
          <div className="w-full h-1.5 rounded-full bg-[#1c2d4f] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#a78bfa] animate-pulse w-2/3" />
          </div>
          <button
            onClick={cancelProcessing}
            className="mt-6 text-xs text-[#4a5a7a] hover:text-[#8899bb] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="w-full max-w-md rounded-2xl border border-[#0e4429] bg-[#0f1219] p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.06)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0a1a10] ring-1 ring-[#10b981]/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-[#10b981] mb-1">Import Complete</h3>
          <p className="text-sm text-[#8899bb]">Your dashboard is ready. Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[420px] px-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'w-full max-w-lg rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300',
          isDragOver
            ? 'border-[#00d4ff] bg-[#0a1628] shadow-[0_0_30px_rgba(0,212,255,0.12)] scale-[1.02]'
            : 'border-[#1c2d4f] bg-[#0a0f1e] hover:border-[#243a65] hover:bg-[#0d1325]',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f1629] ring-1 ring-[#1c2d4f]">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a5a7a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>

        <h3 className="text-lg font-semibold text-[#f0f4ff] mb-2">
          Drop your ActivityWatch export
        </h3>
        <p className="text-sm text-[#8899bb] mb-2">
          Drag & drop your JSON file here, or click to browse
        </p>
        <p className="text-[11px] text-[#4a5a7a]">
          .json files only · 100% private · No data leaves your device
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#1c2d4f] bg-[#0f1629] px-4 py-2 text-xs text-[#4a5a7a]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          All processing happens locally in your browser
        </div>
      </div>
    </div>
  );
}