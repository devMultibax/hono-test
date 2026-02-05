import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, LoadingOverlay, Alert, Stack, Grid, Text, Button, Divider } from '@mantine/core';
import { AlertCircle, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useUser } from '../hooks/useUsers';
import { useIsAdmin } from '@/stores/auth.store';
import { formatDateTime } from '@/lib/date';

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Stack gap="xs">
        <Text size="sm" c="dimmed">{label}</Text>
        <Text fw={500} component="div">{children}</Text>
      </Stack>
    </Grid.Col>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);
  const isAdmin = useIsAdmin();

  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <LoadingOverlay visible />;

  if (error || !user) {
    return (
      <Alert icon={<AlertCircle size={16} />} color="red">
        ไม่พบข้อมูลผู้ใช้
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title="รายละเอียดผู้ใช้"
        breadcrumbs={[
          { label: 'หน้าหลัก', path: '/dashboard' },
          { label: 'ผู้ใช้งาน', path: '/users' },
          { label: 'รายละเอียด' },
        ]}
      >
        {isAdmin && (
          <Button leftSection={<Edit size={16} />} onClick={() => navigate(`/users/${userId}/edit`)}>
            แก้ไข
          </Button>
        )}
      </PageHeader>

      <Paper p="lg" withBorder>
        <Stack gap="lg">
          <section>
            <h3 className="text-lg font-medium mb-4">ข้อมูลบัญชี</h3>
            <Grid>
              <InfoField label="Username">{user.username}</InfoField>
              <InfoField label="Role"><RoleBadge role={user.role} /></InfoField>
              <InfoField label="สถานะ"><StatusBadge status={user.status} /></InfoField>
              <InfoField label="เข้าสู่ระบบล่าสุด">
                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
              </InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">ข้อมูลส่วนตัว</h3>
            <Grid>
              <InfoField label="ชื่อ">{user.firstName}</InfoField>
              <InfoField label="นามสกุล">{user.lastName}</InfoField>
              <InfoField label="อีเมล">{user.email || '-'}</InfoField>
              <InfoField label="เบอร์โทร">{user.tel || '-'}</InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">สังกัด</h3>
            <Grid>
              <InfoField label="แผนก">{user.department?.name || '-'}</InfoField>
              <InfoField label="หน่วยงาน">{user.section?.name || '-'}</InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">ข้อมูลระบบ</h3>
            <Grid>
              <InfoField label="สร้างเมื่อ">{formatDateTime(user.createdAt)}</InfoField>
              <InfoField label="สร้างโดย">{user.createdBy}</InfoField>
              {user.updatedAt && (
                <>
                  <InfoField label="แก้ไขเมื่อ">{formatDateTime(user.updatedAt)}</InfoField>
                  <InfoField label="แก้ไขโดย">{user.updatedBy || '-'}</InfoField>
                </>
              )}
            </Grid>
          </section>
        </Stack>
      </Paper>
    </div>
  );
}
