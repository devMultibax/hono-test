import { useEffect } from 'react';
import { TextInput, Textarea, Select, Button, Stack, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { FormOverlay } from '@/components/common/FormOverlay';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/lib/i18n';
import { getUpdateTypeOptions } from '../types';
import type { Changelog, CreateChangelogRequest, ChangelogFormValues } from '../types';

interface Props {
  initialData?: Changelog;
  onSubmit: (data: CreateChangelogRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ChangelogForm({ initialData, onSubmit, onCancel, isLoading }: Props) {
  const { t } = useTranslation(['changelogs', 'validation', 'common']);
  const updateTypeOptions = getUpdateTypeOptions(t);

  const form = useForm<ChangelogFormValues>({
    initialValues: {
      title: '',
      description: '',
      updateType: 'OTHER',
      gitRef: '',
      updatedDate: new Date(),
    },
    validate: {
      title: (v) => (!v ? t('changelogs:form.title.required') : null),
      updatedDate: (v) => (!v ? t('changelogs:form.updatedDate.required') : null),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        title: initialData.title,
        description: initialData.description ?? '',
        updateType: initialData.updateType,
        gitRef: initialData.gitRef ?? '',
        updatedDate: new Date(initialData.updatedDate),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      title: values.title,
      description: values.description || undefined,
      updateType: values.updateType,
      gitRef: values.gitRef || undefined,
      updatedDate: new Date(values.updatedDate!).toISOString(),
    });
  });

  return (
    <FormOverlay loading={!!isLoading}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t('changelogs:form.title.label')}
            placeholder={t('changelogs:form.title.placeholder')}
            required
            {...form.getInputProps('title')}
          />

          <Select
            label={t('changelogs:form.updateType.label')}
            placeholder={t('changelogs:form.updateType.placeholder')}
            data={updateTypeOptions}
            required
            {...form.getInputProps('updateType')}
          />

          <DatePickerInput
            label={t('changelogs:form.updatedDate.label')}
            placeholder={t('changelogs:form.updatedDate.placeholder')}
            required
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('updatedDate')}
          />

          <TextInput
            label={t('changelogs:form.gitRef.label')}
            placeholder={t('changelogs:form.gitRef.placeholder')}
            {...form.getInputProps('gitRef')}
          />

          <Textarea
            label={t('changelogs:form.description.label')}
            placeholder={t('changelogs:form.description.placeholder')}
            rows={5}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onCancel} disabled={isLoading}>
              {t('common:button.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {t('common:button.confirm')}
            </Button>
          </Group>
        </Stack>
      </form>
    </FormOverlay>
  );
}
