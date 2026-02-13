import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from '@/lib/i18n';
import { StatusSwitch } from '@/components/common/StatusSwitch';
import { SectionActionMenu } from './components/SectionActionMenu';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { Section, SectionQueryParams, Status } from './types';

// === Table Config ===

export const DEFAULT_PARAMS: SectionQueryParams = {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
};

export const SORT_FIELD_MAP: Record<string, string> = {};

// === Column Definitions ===

const columnHelper = createColumnHelper<Section>();

interface UseSectionColumnsOptions {
    onView: (section: Section) => void;
    onEdit: (section: Section) => void;
    onDelete: (section: Section) => void;
    onStatusChange: (section: Section, status: Status) => void;
    currentUserRole: RoleId;
}

export function useSectionColumns({ onView, onEdit, onDelete, onStatusChange, currentUserRole }: UseSectionColumnsOptions) {
    const { t } = useTranslation(['sections']);

    const canEdit = hasRole([ROLE_ID.ADMIN], currentUserRole);

    return useMemo(
        () => [
            columnHelper.accessor((row) => row.department?.name ?? '-', {
                id: 'departmentName',
                header: t('sections:table.column.department'),
            }),
            columnHelper.accessor('name', {
                header: t('sections:table.column.name'),
                enableHiding: false,
            }),
            columnHelper.accessor('status', {
                header: t('sections:table.column.status'),
                cell: ({ row }) => (
                    <StatusSwitch
                        status={row.original.status}
                        onChange={(status) => onStatusChange(row.original, status)}
                        disabled={!canEdit}
                    />
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => (
                    <SectionActionMenu
                        section={row.original}
                        currentUserRole={currentUserRole}
                        onView={() => onView(row.original)}
                        onEdit={() => onEdit(row.original)}
                        onDelete={() => onDelete(row.original)}
                    />
                ),
            }),
        ],
        [onView, onEdit, onDelete, onStatusChange, currentUserRole, canEdit, t],
    );
}
