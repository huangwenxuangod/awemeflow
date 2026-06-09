export interface DouyinVideoResult {
  awemeId: string;
  description: string;
  createTime: number | null;
  createTimeText: string;
  shareUrl: string;
  videoUrl: string;
  videoUri: string;
  gearName: string;
  qualityType: number | string | null;
  bitRate: number;
  width: number;
  height: number;
  dataSize: number;
  format: string;
  coverUrl: string;
  authorUid: string;
  authorSecUid: string;
  authorNickname: string;
  sourcePage: string;
}

export interface ResolveDouyinInput {
  input?: string;
  url?: string;
  awemeId?: string;
  ratio?: string;
  debug?: boolean;
}

export interface TraceEvent {
  time: string;
  stage: string;
  message: string;
  [key: string]: unknown;
}

export interface ResolveDouyinResult {
  data: DouyinVideoResult;
  traceId: string;
  debug?: TraceEvent[];
}

export interface TtwidValue {
  ttwid: string;
  cookie: string;
  expiresAt: number;
}

export interface DouyinCache {
  get<T>(key: string): Promise<T | null>;
  put<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export type UnknownRecord = Record<string, unknown>;
