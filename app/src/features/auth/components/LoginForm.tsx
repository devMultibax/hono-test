import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => {
        if (!v) return 'กรุณากรอก Username';
        if (v.length !== 6) return 'Username ต้องมี 6 ตัวอักษร';
        if (!/^[a-zA-Z0-9]+$/.test(v)) return 'ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น';
        return null;
      },
      password: (v) => {
        if (!v) return 'กรุณากรอกรหัสผ่าน';
        if (v.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  return (
    <form onSubmit={form.onSubmit(login)}>
      <Stack gap="md">
        <TextInput
          label="Username"
          placeholder="กรอก username 6 หลัก"
          leftSection={<User size={16} />}
          maxLength={6}
          {...form.getInputProps('username')}
        />

        <PasswordInput
          label="รหัสผ่าน"
          placeholder="กรอกรหัสผ่าน"
          leftSection={<Lock size={16} />}
          {...form.getInputProps('password')}
        />

        <Button type="submit" fullWidth loading={isLoggingIn} mt="sm">
          เข้าสู่ระบบ
        </Button>
      </Stack>
    </form>
  );
}
