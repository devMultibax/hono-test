import { apiClient } from '../client';
import type { DatabaseStatistics, AnalyzeResult } from '@/types';

export const databaseApi = {
  getStatistics: () =>
    apiClient.get<DatabaseStatistics>('/database/statistics'),

  analyze: () =>
    apiClient.post<AnalyzeResult>('/database/analyze'),
};
