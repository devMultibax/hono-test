import { apiClient } from '../client';
import type { DatabaseStatistics, AnalyzeResult } from '@/types';

export const databaseApi = {
  getStatistics: () =>
    apiClient.get<{ data: DatabaseStatistics }>('/database/statistics'),

  analyze: () =>
    apiClient.post<{ data: AnalyzeResult }>('/database/analyze'),
};
