import { apiClient, downloadFile } from '../client';
import type {
    Section,
    CreateSectionRequest,
    UpdateSectionRequest,
    SectionListResponse,
    SectionQueryParams,
} from '@/types';

const buildQueryString = (params?: SectionQueryParams): string => {
    if (!params) return '';
    const entries = Object.entries(params).filter(([, v]) => v != null);
    return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
};

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

    exportExcel: (params?: SectionQueryParams) =>
        downloadFile(`/sections/export/excel?${buildQueryString(params)}`, `sections-${Date.now()}.xlsx`),

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/sections/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
