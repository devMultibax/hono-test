import { Paper, SimpleGrid, Title } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { useTranslation } from '@/lib/i18n';
import { UserFilterFields } from './UserFilterFields';
import type { UserQueryParams } from '../types';

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
}

export function UserFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['users']);
  const update = (patch: Partial<UserQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <Title order={5} size="h6" mb="md" c="dimmed">{t('users:filter.title')}</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
        <SearchInput
          label={t('users:filter.searchLabel')}
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('users:filter.searchPlaceholder')}
        />

        <UserFilterFields values={params} onUpdate={update} />
      </SimpleGrid>
    </Paper>
  );
}
