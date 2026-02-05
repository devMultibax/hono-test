import { useEffect } from 'react';
import { TextInput, Select, Button, Grid, Stack, Paper, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import type { User, CreateUserRequest } from '@/types';

interface Props {
  initialData?: User;
  onSubmit: (data: CreateUserRequest) => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'ใช้งาน' },
  { value: 'inactive', label: 'ไม่ใช้งาน' },
];

export function UserForm({ initialData, onSubmit, isLoading }: Props) {
  const isEdit = !!initialData;

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
      username: (v) => (!v ? 'กรุณากรอก Username' : !/^\d{6}$/.test(v) ? 'Username ต้องเป็นตัวเลข 6 หลัก' : null),
      firstName: (v) => (!v ? 'กรุณากรอกชื่อ' : null),
      lastName: (v) => (!v ? 'กรุณากรอกนามสกุล' : null),
      departmentId: (v) => (!v ? 'กรุณาเลือกแผนก' : null),
      email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'รูปแบบอีเมลไม่ถูกต้อง' : null),
      tel: (v) => (v && !/^\d{10}$/.test(v) ? 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' : null),
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
            <h3 className="text-lg font-medium mb-4">ข้อมูลบัญชี</h3>
            <TextInput
              label="Username"
              placeholder="กรอก username 6 หลัก"
              disabled={isEdit}
              maxLength={6}
              required
              {...form.getInputProps('username')}
            />
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">ข้อมูลส่วนตัว</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="ชื่อ" placeholder="กรอกชื่อ" required {...form.getInputProps('firstName')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="นามสกุล" placeholder="กรอกนามสกุล" required {...form.getInputProps('lastName')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="อีเมล" placeholder="example@email.com" {...form.getInputProps('email')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="เบอร์โทร" placeholder="0812345678" maxLength={10} {...form.getInputProps('tel')} />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">สังกัด</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DepartmentSelect
                  label="แผนก"
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
                  label="หน่วยงาน"
                  departmentId={form.values.departmentId}
                  value={form.values.sectionId}
                  onChange={(value) => form.setFieldValue('sectionId', value)}
                />
              </Grid.Col>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">สิทธิ์และสถานะ</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label="Role" data={ROLE_OPTIONS} required {...form.getInputProps('role')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label="สถานะ" data={STATUS_OPTIONS} required {...form.getInputProps('status')} />
              </Grid.Col>
            </Grid>
          </section>

          <Button type="submit" loading={isLoading} size="md">
            {isEdit ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
