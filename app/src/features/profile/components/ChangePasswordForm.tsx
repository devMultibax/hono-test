import { useState } from 'react';
import {
    PasswordInput, Button, Stack, Text, Paper, List, ThemeIcon,
    Container, Title, Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/services/auth.api';
import { Report, Confirm, handleError } from '@/utils/mantineAlertUtils';

interface PasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
    hasLetter: /[a-zA-Z]/,
    hasNumber: /\d/,
};

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <List.Item
            icon={
                <ThemeIcon color={met ? 'teal' : 'gray'} size={20} radius="xl" variant="light">
                    {met ? <Check size={12} /> : <X size={12} />}
                </ThemeIcon>
            }
        >
            <Text size="sm" c={met ? 'teal' : 'dimmed'}>
                {text}
            </Text>
        </List.Item>
    );
}

export function ChangePasswordForm() {
    const { logout } = useAuth();
    const { t } = useTranslation(['profile', 'validation', 'common']);
    const [loading, setLoading] = useState(false);

    const form = useForm<PasswordFormValues>({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            currentPassword: (v) => (!v ? t('validation:required.password') : null),
            newPassword: (v) => {
                if (!v) return t('validation:required.password');
                if (v.length < PASSWORD_MIN_LENGTH) return t('validation:format.passwordMinLength');
                if (!PASSWORD_REGEX.hasLetter.test(v) || !PASSWORD_REGEX.hasNumber.test(v)) {
                    return t('profile:password.requirements.requireLetterAndNumber');
                }
                return null;
            },
            confirmPassword: (v, values) => {
                if (!v) return t('validation:required.password');
                if (v !== values.newPassword) return t('profile:password.requirements.mustMatch');
                return null;
            },
        },
        validateInputOnBlur: true,
    });

    const { newPassword, confirmPassword } = form.values;
    const hasMinLength = newPassword.length >= PASSWORD_MIN_LENGTH;
    const hasLetterAndNumber = PASSWORD_REGEX.hasLetter.test(newPassword) && PASSWORD_REGEX.hasNumber.test(newPassword);
    const passwordsMatch = Boolean(newPassword && newPassword === confirmPassword);

    const handleSubmit = form.onSubmit(async (values) => {
        const confirmed = await Confirm.show(t('profile:confirm.changePassword'));
        if (!confirmed) return;

        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            Report.success(t('profile:message.passwordChanged'), async () => {
                await logout();
            });
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Container size="sm" px={0}>
            <Paper p="lg" radius="md" withBorder>
                <Title order={5} c="dimmed" mb="md">
                    {t('profile:password.change')}
                </Title>

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <PasswordInput
                            label={t('profile:password.current')}
                            placeholder={t('profile:password.current')}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                            {...form.getInputProps('currentPassword')}
                        />

                        <PasswordInput
                            label={t('profile:password.new')}
                            placeholder={t('profile:password.new')}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            {...form.getInputProps('newPassword')}
                        />

                        <PasswordInput
                            label={t('profile:password.confirm')}
                            placeholder={t('profile:password.confirm')}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            {...form.getInputProps('confirmPassword')}
                        />

                        {/* Password Requirements */}
                        <Paper withBorder p="md" radius="md" bg="gray.0">
                            <Text fw={500} size="sm" mb="xs">
                                {t('profile:password.requirements.title')}
                            </Text>
                            <List spacing="xs" size="sm">
                                <RequirementItem met={hasMinLength} text={t('profile:password.requirements.minLength')} />
                                <RequirementItem met={hasLetterAndNumber} text={t('profile:password.requirements.requireLetterAndNumber')} />
                                <RequirementItem met={passwordsMatch} text={t('profile:password.requirements.mustMatch')} />
                            </List>
                        </Paper>

                        <Divider />

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                        >
                            {t('profile:password.change')}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
