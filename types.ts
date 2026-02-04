
export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  duration?: number;
}

export interface ShortsCandidate {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  description: string;
  confidence: number;
  status: 'pending' | 'selected' | 'discarded';
  scheduledTime?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  REVIEWING = 'REVIEWING'
}
