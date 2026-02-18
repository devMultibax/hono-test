import { Container, Tabs, rem } from '@mantine/core';
import { User, LockKeyhole } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { ProfileForm } from '../components/ProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

export function ProfilePage() {
    const { t } = useTranslation(['profile']);
    const navigate = useNavigate();
    const location = useLocation();

    const isPasswordTab = location.pathname.includes('/password');
    const activeTab = isPasswordTab ? 'password' : 'profile';

    const handleTabChange = (value: string | null) => {
        if (value === 'password') {
            navigate('/profile/password');
        } else {
            navigate('/profile');
        }
    };

    return (
        <Container size="lg" py="md">
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="outline"
                radius="md"
                styles={{
                    tab: {
                        fontWeight: 500,
                        height: rem(42),
                        paddingInline: rem(20),
                    },
                    panel: {
                        paddingTop: rem(20),
                    },
                }}
            >
                <Tabs.List>
                    <Tabs.Tab value="profile" leftSection={<User size={16} />}>
                        {t('profile:tab.profile')}
                    </Tabs.Tab>
                    <Tabs.Tab value="password" leftSection={<LockKeyhole size={16} />}>
                        {t('profile:tab.password')}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="profile">
                    <ProfileForm />
                </Tabs.Panel>

                <Tabs.Panel value="password">
                    <ChangePasswordForm />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
