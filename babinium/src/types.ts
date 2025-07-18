export const AppState = {
  IDLE: 'IDLE',
  PREVIEW: 'PREVIEW',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type AppState = typeof AppState[keyof typeof AppState];

export type TableRow = Record<string, string | number>;

export type TableData = TableRow[];
