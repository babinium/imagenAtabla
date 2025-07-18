export enum AppState {
  IDLE,
  PREVIEW,
  PROCESSING,
  SUCCESS,
  ERROR,
}

export type TableRow = Record<string, string | number>;

export type TableData = TableRow[];
