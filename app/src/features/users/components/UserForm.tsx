import { useEffect } from 'react';
import { TextInput, Select, Button, Grid, Stack, Paper, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import type { User, CreateUserRequest } from '@/types';

interface Props {
  initialData?: User;
  onSubmit: (data: CreateUserRequest) => void;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: Props) {
  const isEdit = !!initialData;
  const { t } = useTranslation(['users', 'validation', 'common']);

  const ROLE_OPTIONS = [
    { value: 'USER', label: t('common:role.USER') },
    { value: 'ADMIN', label: t('common:role.ADMIN') },
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: t('common:status.active') },
    { value: 'inactive', label: t('common:status.inactive') },
  ];

  const form = useForm({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      departmentId: null as number | null,
      sectionId: null as number | null,
      email: '',
      tel: '',
      role: 'USER' as 'USER' | 'ADMIN',
      status: 'active' as 'active' | 'inactive',
    },
    validate: {
      username: (v) => (!v ? t('validation:required.username') : !/^\d{6}$/.test(v) ? t('validation:format.usernameDigits') : null),
      firstName: (v) => (!v ? t('validation:required.firstName') : null),
      lastName: (v) => (!v ? t('validation:required.lastName') : null),
      departmentId: (v) => (!v ? t('validation:required.department') : null),
      email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t('validation:format.emailInvalid') : null),
      tel: (v) => (v && !/^\d{10}$/.test(v) ? t('validation:format.telInvalid') : null),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        username: initialData.username,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        departmentId: initialData.departmentId,
        sectionId: initialData.sectionId,
        email: initialData.email ?? '',
        tel: initialData.tel ?? '',
        role: initialData.role,
        status: initialData.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
      departmentId: values.departmentId!,
      sectionId: values.sectionId ?? undefined,
      email: values.email || undefined,
      tel: values.tel || undefined,
      role: values.role,
      status: values.status,
    });
  });

  return (
    <Paper p="lg" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:form.section.account')}</h3>
            <TextInput
              label={t('users:form.username.label')}
              placeholder={t('users:form.username.placeholder')}
              disabled={isEdit}
              maxLength={6}
              required
              {...form.getInputProps('username')}
            />
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:form.section.personal')}</h3>
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
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:form.section.affiliation')}</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DepartmentSelect
                  label={t('common:label.department')}
                  required
                  value={form.values.departmentId}
                  onChange={(value) => {
                    form.setFieldValue('departmentId', value);
                    form.setFieldValue('sectionId', null);
                  }}
                  error={form.errors.departmentId as string}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <SectionSelect
                  label={t('common:label.section')}
                  departmentId={form.values.departmentId}
                  value={form.values.sectionId}
                  onChange={(value) => form.setFieldValue('sectionId', value)}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:form.section.permissions')}</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label={t('common:label.role')} data={ROLE_OPTIONS} required {...form.getInputProps('role')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label={t('common:label.status')} data={STATUS_OPTIONS} required {...form.getInputProps('status')} />
              </Grid.Col>
            </Grid>
          </section>

          <Button type="submit" loading={isLoading} size="md">
            {isEdit ? t('users:form.button.update') : t('users:form.button.create')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
