import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { DatabaseStatistics, AnalyzeResult } from '@/types';

export const databaseApi = {
  getStatistics: () =>
    apiClient.get<DatabaseStatistics>(API_ENDPOINTS.DATABASE.STATISTICS),

  analyze: () =>
    apiClient.post<AnalyzeResult>(API_ENDPOINTS.DATABASE.ANALYZE),
};
