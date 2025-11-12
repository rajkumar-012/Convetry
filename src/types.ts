export type ConversionCategory = 'image' | 'audio' | 'video' | 'pdf' | 'text';

export interface ConversionRequest {
  id: string;
  sourceUri: string;
  sourceName: string;
  category: ConversionCategory;
  targetFormat: string;
  parameters?: Record<string, unknown>;
}

export type JobState = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ConversionJob extends ConversionRequest {
  state: JobState;
  progress: number;
  outputUri?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ConversionResult {
  success: boolean;
  outputUri?: string;
  error?: string;
}

export interface ConversionDescriptor {
  label: string;
  category: ConversionCategory;
  supportedTargets: string[];
  defaultTarget: string;
  extensions: string[];
}

