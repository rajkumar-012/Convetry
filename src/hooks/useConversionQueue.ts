import { useCallback, useEffect, useRef } from 'react';

import { runConversion } from '../services/conversionService';
import { useConversionStore } from '../store/useConversionStore';

export function useConversionQueue() {
  const jobs = useConversionStore((state) => state.jobs);
  const setJobState = useConversionStore((state) => state.setJobState);
  const completeJob = useConversionStore((state) => state.completeJob);
  const updateJob = useConversionStore((state) => state.updateJob);
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    try {
      while (true) {
        const nextJob = useConversionStore.getState().jobs.find((job) => job.state === 'queued');
        if (!nextJob) {
          break;
        }

        setJobState(nextJob.id, 'running', 5);

        const result = await runConversion(nextJob, (progress) => {
          updateJob(nextJob.id, { progress, state: 'running' });
        });

        completeJob(nextJob.id, result);
      }
    } finally {
      processingRef.current = false;
    }
  }, [completeJob, setJobState, updateJob]);

  useEffect(() => {
    const hasQueued = jobs.some((job) => job.state === 'queued');
    const hasRunning = jobs.some((job) => job.state === 'running');
    if (hasQueued && !hasRunning) {
      void processQueue();
    }
  }, [jobs, processQueue]);
}

