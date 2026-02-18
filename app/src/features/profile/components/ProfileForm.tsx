import { useState, useEffect } from 'react';
import { TextInput, Button, Grid, Paper, Stack, Group, Title, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/lib/i18n';
import { useUser, useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/services/auth.api';
import { Report, Confirm, handleError } from '@/utils/mantineAlertUtils';
import { InfoField } from '@/components/common/InfoField';
import { RoleBadge } from '@/components/common/RoleBadge';

interface ProfileFormValues {
    firstName: string;
    lastName: string;
    email: string;
    tel: string;
}

export function ProfileForm() {
    const user = useUser();
    const updateUser = useAuthStore((s) => s.updateUser);
    const { t } = useTranslation(['profile', 'validation', 'common']);
    const [loading, setLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            tel: '',
        },
        validate: {
            firstName: (v) => (!v ? t('validation:required.firstName') : null),
            lastName: (v) => (!v ? t('validation:required.lastName') : null),
            email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t('validation:format.emailInvalid') : null),
            tel: (v) => (v && !/^\d{10}$/.test(v) ? t('validation:format.telInvalid') : null),
        },
        validateInputOnBlur: true,
    });

    useEffect(() => {
        if (user) {
            const values: ProfileFormValues = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email ?? '',
                tel: user.tel ?? '',
            };
            form.setInitialValues(values);
            form.setValues(values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSubmit = form.onSubmit(async (values) => {
        const confirmed = await Confirm.show(t('profile:confirm.saveProfile'));
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await authApi.updateMe({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email || undefined,
                tel: values.tel || undefined,
            });

            updateUser(res.data.user);

            Report.success(t('profile:message.profileUpdated'));
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Stack gap="lg">
            {/* Account Info — Read Only */}
            <Paper p="lg" radius="md" withBorder>
                <Title order={5} c="dimmed" mb="md">
                    {t('profile:section.accountInfo')}
                </Title>
                <Grid>
                    <InfoField label={t('profile:field.username')}>
                        {user?.username ?? '-'}
                    </InfoField>
                    <InfoField label={t('profile:field.role')}>
                        <RoleBadge role={user?.role ?? 'USER'} />
                    </InfoField>
                    <InfoField label={t('profile:field.department')}>
                        {user?.department?.name ?? '-'}
                    </InfoField>
                    <InfoField label={t('profile:field.section')}>
                        {user?.section?.name ?? '-'}
                    </InfoField>
                </Grid>
            </Paper>

            {/* Personal Info — Editable */}
            <Paper p="lg" radius="md" withBorder>
                <Title order={5} c="dimmed" mb="md">
                    {t('profile:section.personalInfo')}
                </Title>

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label={t('profile:field.firstName')}
                                    required
                                    disabled={loading}
                                    {...form.getInputProps('firstName')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label={t('profile:field.lastName')}
                                    required
                                    disabled={loading}
                                    {...form.getInputProps('lastName')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label={t('profile:field.email')}
                                    type="email"
                                    placeholder={t('common:placeholder.enterEmail')}
                                    disabled={loading}
                                    {...form.getInputProps('email')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label={t('profile:field.tel')}
                                    type="tel"
                                    placeholder={t('common:placeholder.enterTel')}
                                    maxLength={10}
                                    disabled={loading}
                                    {...form.getInputProps('tel')}
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider />

                        <Group justify="flex-end">
                            <Button
                                type="submit"
                                loading={loading}
                            >
                                {t('common:button.save')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
}
