import { create } from 'zustand';

import type { ConversionJob, ConversionRequest, ConversionResult, JobState } from '../types';

export interface ConversionStoreState {
  jobs: ConversionJob[];
  enqueue: (request: ConversionRequest) => void;
  updateJob: (id: string, patch: Partial<ConversionJob>) => void;
  completeJob: (id: string, result: ConversionResult) => void;
  setJobState: (id: string, state: JobState, progress?: number) => void;
  clearCompleted: () => void;
}

export const useConversionStore = create<ConversionStoreState>((set) => ({
  jobs: [],
  enqueue: (request) =>
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          ...request,
          state: 'queued',
          progress: 0,
          createdAt: Date.now(),
        },
      ],
    })),
  updateJob: (id, patch) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              ...patch,
            }
          : job,
      ),
    })),
  completeJob: (id, result) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              state: result.success ? 'completed' : 'failed',
              progress: result.success ? 100 : job.progress,
              outputUri: result.outputUri,
              error: result.error,
              completedAt: Date.now(),
            }
          : job,
      ),
    })),
  setJobState: (id, state, progress) =>
    set((store) => ({
      jobs: store.jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              state,
              progress: progress ?? job.progress,
            }
          : job,
      ),
    })),
  clearCompleted: () =>
    set((store) => ({
      jobs: store.jobs.filter((job) => job.state !== 'completed'),
    })),
}));

