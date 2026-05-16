import type { ParserWorkerRequest, ParserWorkerResult, ParserWorkerError, ParserWorkerProgress } from '@/types';
import { AWParser } from '@/modules/parser/AWParser';

self.onmessage = (event: MessageEvent<ParserWorkerRequest>) => {
  const { id, payload } = event.data;

  try {
    const progressInit: ParserWorkerProgress = {
      type: 'progress',
      id,
      step: 'Initializing ActivityWatch universal parser engine...',
      percent: 10,
    };
    self.postMessage(progressInit);

    const progressProcessing: ParserWorkerProgress = {
      type: 'progress',
      id,
      step: 'Analyzing cross-platform buckets and reconstructing daily timelines...',
      percent: 45,
    };
    self.postMessage(progressProcessing);

    const parser = new AWParser();
    const result = parser.parse(payload);

    const progressFinalizing: ParserWorkerProgress = {
      type: 'progress',
      id,
      step: 'Finalizing intelligence score matrices...',
      percent: 90,
    };
    self.postMessage(progressFinalizing);

    const response: ParserWorkerResult = {
      type: 'result',
      id,
      windowEvents: result.windowEvents,
      afkEvents: result.afkEvents,
      dailySummaries: result.dailySummaries,
    };

    self.postMessage(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown parsing error';
    const errorResponse: ParserWorkerError = {
      type: 'error',
      id,
      message,
    };
    self.postMessage(errorResponse);
  }
};
