import { useEffect } from 'react';
import { TextInput, Select, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/lib/i18n';
import { getStatusOptions } from '@/constants/options';
import type { Department, CreateDepartmentRequest, DepartmentFormValues } from '../types';

interface Props {
  initialData?: Department;
  onSubmit: (data: CreateDepartmentRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({ initialData, onSubmit, onCancel, isLoading }: Props) {
  const { t } = useTranslation(['departments', 'validation', 'common']);

  const STATUS_OPTIONS = getStatusOptions(t);

  const form = useForm<DepartmentFormValues>({
    initialValues: {
      name: '',
      status: 'active',
    },
    validate: {
      name: (v) => (!v ? t('validation:required.department') : null),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name,
        status: initialData.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      name: values.name,
      status: values.status,
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label={t('departments:form.name.label')}
          placeholder={t('departments:form.name.placeholder')}
          required
          {...form.getInputProps('name')}
        />

        <Select
          label={t('common:label.status')}
          data={STATUS_OPTIONS}
          required
          {...form.getInputProps('status')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onCancel}>
            {t('common:button.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t('common:button.confirm')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
