import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { saveDataset } from '@/lib/db';
import type { ParserWorkerResponse, ParserWorkerResult, ParserWorkerError } from '@/types';

type ProcessorStatus = 'idle' | 'processing' | 'done' | 'error';

export function useDatasetProcessor() {
  const setLoading = useAppStore((s) => s.setLoading);
  const setDataset = useAppStore((s) => s.setDataset);
  const setError = useAppStore((s) => s.setError);
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<ProcessorStatus>('idle');
  const [progressMessage, setProgressMessage] = useState<string>('');

  const processFile = useCallback(
    async (file: File): Promise<void> => {
      setLoading();
      setStatus('processing');
      setProgressMessage('Reading file...');

      let text: string;
      try {
        text = await file.text();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to read file';
        setError({ message: msg, code: 'FILE_READ_ERROR' });
        setStatus('error');
        return;
      }

      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker(
        new URL('../workers/parser.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerRef.current = worker;

      const requestId = `parse-${Date.now()}`;

      worker.onmessage = (event: MessageEvent<ParserWorkerResponse>) => {
        const msg = event.data;

        if (msg.type === 'progress') {
          setProgressMessage(msg.step);
          return;
        }

        if (msg.type === 'result') {
          const result = msg as ParserWorkerResult;
          setDataset(
            result.windowEvents,
            result.afkEvents,
            result.dailySummaries,
            new Date().toISOString(),
          );
          saveDataset({
            status: 'loaded',
            error: null,
            windowEvents: result.windowEvents,
            afkEvents: result.afkEvents,
            dailySummaries: result.dailySummaries,
            processedAt: new Date().toISOString(),
          }).catch(() => {});
          setStatus('done');
          worker.terminate();
          workerRef.current = null;
          return;
        }

        if (msg.type === 'error') {
          const err = msg as ParserWorkerError;
          setError({ message: err.message, code: 'PARSE_ERROR' });
          setStatus('error');
          worker.terminate();
          workerRef.current = null;
          return;
        }
      };

      worker.onerror = (ev: ErrorEvent) => {
        setError({ message: ev.message || 'Worker error', code: 'WORKER_ERROR' });
        setStatus('error');
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ id: requestId, payload: text });
    },
    [setLoading, setDataset, setError],
  );

  const cancelProcessing = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus('idle');
    setProgressMessage('');
  }, []);

  return { processFile, cancelProcessing, status, progressMessage };
}