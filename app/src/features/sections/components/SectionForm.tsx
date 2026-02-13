import { useEffect } from 'react';
import { TextInput, Select, Button, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/lib/i18n';
import { getStatusOptions } from '@/constants/options';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import type { Section, CreateSectionRequest, SectionFormValues } from '../types';

interface Props {
  initialData?: Section;
  onSubmit: (data: CreateSectionRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SectionForm({ initialData, onSubmit, onCancel, isLoading }: Props) {
  const { t } = useTranslation(['sections', 'validation', 'common']);

  const STATUS_OPTIONS = getStatusOptions(t);

  const form = useForm<SectionFormValues>({
    initialValues: {
      name: '',
      departmentId: null,
      status: 'active',
    },
    validate: {
      name: (v) => (!v ? t('validation:required.section') : null),
      departmentId: (v) => (!v ? t('validation:required.department') : null),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name,
        departmentId: initialData.departmentId,
        status: initialData.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      name: values.name,
      departmentId: values.departmentId!,
      status: values.status,
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <DepartmentSelect
          label={t('sections:form.department.label')}
          placeholder={t('sections:form.department.placeholder')}
          value={form.values.departmentId}
          onChange={(val) => form.setFieldValue('departmentId', val)}
          error={form.errors.departmentId}
          required
        />

        <TextInput
          label={t('sections:form.name.label')}
          placeholder={t('sections:form.name.placeholder')}
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
