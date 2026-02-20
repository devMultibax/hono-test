export type LogLevel = 'info' | 'warn' | 'error';

export interface SystemLog {
  datetime: string;
  level: LogLevel;
  username: string;
  fullName: string;
  method: string;
  url: string;
  ip: string;
  event: string;
}

export interface SystemLogQueryParams {
  startDateTime: string;
  endDateTime: string;
  level?: string;
}