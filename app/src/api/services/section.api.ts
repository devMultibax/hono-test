import { apiClient, downloadFile } from '../client';
import type {
    Section,
    CreateSectionRequest,
    UpdateSectionRequest,
    SectionListResponse,
    SectionQueryParams,
} from '@/types';

export const sectionApi = {
    getAll: (params: SectionQueryParams) =>
        apiClient.get<SectionListResponse>('/sections', { params: { ...params, include: 'true' } }),

    getById: (id: number) =>
        apiClient.get<Section>(`/sections/${id}`, { params: { include: 'true' } }),

    create: (data: CreateSectionRequest) =>
        apiClient.post<Section>('/sections', data),

    update: (id: number, data: UpdateSectionRequest) =>
        apiClient.put<Section>(`/sections/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/sections/${id}`),

    exportExcel: (params?: SectionQueryParams, signal?: AbortSignal) =>
        downloadFile('/sections/export/excel', `sections-${Date.now()}.xlsx`, signal, params as Record<string, unknown>),

    downloadTemplate: () =>
        downloadFile('/sections/template', 'section-import-template.xlsx'),

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/sections/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
