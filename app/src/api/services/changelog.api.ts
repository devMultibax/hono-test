import { apiClient } from '../client';
import type {
  Changelog,
  CreateChangelogRequest,
  UpdateChangelogRequest,
  ChangelogListResponse,
  ChangelogQueryParams,
} from '@/types';

export const changelogApi = {
  getAll: (params: ChangelogQueryParams) =>
    apiClient.get<ChangelogListResponse>('/changelogs', { params }),

  getById: (id: number) =>
    apiClient.get<{ data: Changelog }>(`/changelogs/${id}`),

  create: (data: CreateChangelogRequest) =>
    apiClient.post<{ data: Changelog }>('/changelogs', data),

  update: (id: number, data: UpdateChangelogRequest) =>
    apiClient.put<{ data: Changelog }>(`/changelogs/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/changelogs/${id}`),
};
