import { useEffect, useMemo } from 'react';
import { TextInput, Select, Button, Grid, Stack, Group, ActionIcon, Text, Tooltip } from '@mantine/core';
import { IconTrash, IconPlus, IconStar, IconStarFilled } from '@tabler/icons-react';
import { FormOverlay } from '@/components/common/FormOverlay';
import { useForm } from '@mantine/form';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import { getRoleOptions, getStatusOptions } from '@/constants/options';
import type { User, CreateUserRequest } from '../types';
import type { UserFormValues, DepartmentFormEntry } from '../types';

interface Props {
  initialData?: User;
  onSubmit: (data: CreateUserRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DEFAULT_DEPARTMENT_ENTRY: DepartmentFormEntry = {
  departmentId: null,
  sectionId: null,
  isPrimary: true,
};

export function UserForm({ initialData, onSubmit, onCancel, isLoading }: Props) {
  const isEdit = !!initialData;
  const { t } = useTranslation(['users', 'validation', 'common']);

  const ROLE_OPTIONS = getRoleOptions(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  const form = useForm<UserFormValues>({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      departments: [{ ...DEFAULT_DEPARTMENT_ENTRY }],
      email: '',
      tel: '',
      role: 'USER',
      status: 'active',
    },
    validate: {
      username: (v) => (!v ? t('validation:required.employeeId') : !/^\d{6}$/.test(v) ? t('validation:format.employeeIdDigits') : null),
      firstName: (v) => (!v ? t('validation:required.firstName') : null),
      lastName: (v) => (!v ? t('validation:required.lastName') : null),
      departments: {
        departmentId: (v) => (!v ? t('validation:required.departmentInRow') : null),
      },
      email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t('validation:format.emailInvalid') : null),
      tel: (v) => (v && !/^\d{10}$/.test(v) ? t('validation:format.telInvalid') : null),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      const departments: DepartmentFormEntry[] = initialData.departments?.length
        ? initialData.departments.map((ud) => ({
            departmentId: ud.departmentId,
            sectionId: ud.sectionId,
            isPrimary: ud.isPrimary,
          }))
        : [{ ...DEFAULT_DEPARTMENT_ENTRY }];

      form.setValues({
        username: initialData.username,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        departments,
        email: initialData.email ?? '',
        tel: initialData.tel ?? '',
        role: initialData.role,
        status: initialData.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Department IDs already selected (for filtering duplicates)
  const selectedDeptIds = useMemo(
    () => new Set(form.values.departments.map((d) => d.departmentId).filter(Boolean) as number[]),
    [form.values.departments]
  );

  const handleAddDepartment = () => {
    form.insertListItem('departments', {
      departmentId: null,
      sectionId: null,
      isPrimary: false,
    });
  };

  const handleRemoveDepartment = (index: number) => {
    const wasPrimary = form.values.departments[index].isPrimary;
    form.removeListItem('departments', index);
    if (wasPrimary && form.values.departments.length > 1) {
      const newIndex = index === 0 ? 0 : index - 1;
      form.setFieldValue(`departments.${newIndex}.isPrimary`, true);
    }
  };

  const handlePrimaryChange = (index: number) => {
    form.values.departments.forEach((_, i) => {
      form.setFieldValue(`departments.${i}.isPrimary`, i === index);
    });
  };

  const handleDepartmentChange = (index: number, value: number | null) => {
    form.setFieldValue(`departments.${index}.departmentId`, value);
    form.setFieldValue(`departments.${index}.sectionId`, null);
  };

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
      departments: values.departments
        .filter((d) => d.departmentId !== null)
        .map((d) => ({
          departmentId: d.departmentId!,
          sectionId: d.sectionId ?? undefined,
          isPrimary: d.isPrimary,
        })),
      email: values.email || undefined,
      tel: values.tel || undefined,
      role: values.role,
      status: values.status,
    });
  });

  return (
    <FormOverlay loading={!!isLoading}>
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label={t('users:form.username.label')}
          placeholder={t('users:form.username.placeholder')}
          disabled={isEdit}
          maxLength={6}
          required
          {...form.getInputProps('username')}
        />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label={t('users:form.firstName.label')} placeholder={t('users:form.firstName.placeholder')} required {...form.getInputProps('firstName')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label={t('users:form.lastName.label')} placeholder={t('users:form.lastName.placeholder')} required {...form.getInputProps('lastName')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label={t('users:form.email.label')} placeholder={t('users:form.email.placeholder')} {...form.getInputProps('email')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label={t('users:form.tel.label')} placeholder={t('users:form.tel.placeholder')} maxLength={10} {...form.getInputProps('tel')} />
          </Grid.Col>
        </Grid>

        {/* Department Repeater */}
        <Stack gap="xs">
          <Text fw={500} size="sm">{t('users:form.departments.label')} <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
          {form.values.departments.map((entry, index) => (
            <Group key={index} gap="xs" align="flex-end" wrap="nowrap" style={entry.isPrimary ? { borderLeft: '3px solid var(--mantine-color-blue-5)', paddingLeft: 8 } : { paddingLeft: 11 }}>
              <DepartmentSelect
                label={index === 0 ? t('common:label.department') : undefined}
                required
                value={entry.departmentId}
                onChange={(value) => handleDepartmentChange(index, value)}
                error={form.errors[`departments.${index}.departmentId`] as string}
                excludeIds={[...selectedDeptIds].filter((id) => id !== entry.departmentId)}
                style={{ flex: 1 }}
              />
              <SectionSelect
                label={index === 0 ? t('common:label.section') : undefined}
                departmentId={entry.departmentId}
                value={entry.sectionId}
                onChange={(value) => form.setFieldValue(`departments.${index}.sectionId`, value)}
                style={{ flex: 1 }}
              />
              <Tooltip label={entry.isPrimary ? t('users:form.departments.primary') : t('users:form.departments.setPrimary')}>
                <ActionIcon
                  variant={entry.isPrimary ? 'filled' : 'subtle'}
                  color="blue"
                  size="lg"
                  onClick={() => !entry.isPrimary && handlePrimaryChange(index)}
                  style={entry.isPrimary ? { cursor: 'default' } : undefined}
                >
                  {entry.isPrimary ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                </ActionIcon>
              </Tooltip>
              {form.values.departments.length > 1 ? (
                <Tooltip label={t('users:form.departments.remove')}>
                  <ActionIcon variant="subtle" color="red" size="lg" onClick={() => handleRemoveDepartment(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <ActionIcon variant="transparent" size="lg" disabled style={{ visibility: 'hidden' }}>
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          ))}
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddDepartment}
          >
            {t('users:form.departments.addButton')}
          </Button>
        </Stack>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select label={t('common:label.role')} data={ROLE_OPTIONS} required {...form.getInputProps('role')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select label={t('common:label.status')} data={STATUS_OPTIONS} required {...form.getInputProps('status')} />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onCancel}>
            {t('common:button.cancel')}
          </Button>
          <Button type="submit">
            {t('common:button.confirm')}
          </Button>
        </Group>
      </Stack>
    </form>
    </FormOverlay>
  );
}
