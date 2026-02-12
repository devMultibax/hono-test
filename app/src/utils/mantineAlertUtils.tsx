import { Text, Button, Group, Stack, ThemeIcon, Alert } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconCircleCheck,
  IconCircleX,
  IconAlertTriangle,
  IconInfoCircle,
} from '@tabler/icons-react';
import { t } from '@/lib/i18n/helpers';
import { handleErrorMode } from './errorHandlerUtils';

function boldQuoted(text: string, color?: string): string {
  const style = color ? ` style="color:${color}"` : '';
  return text.replace(/"([^"]+)"/g, `<b${style}>$1</b>`);
}

type ReportType = 'success' | 'error' | 'warning' | 'info';

const reportConfig: Record<
  ReportType,
  { color: string; icon: typeof IconCircleCheck; titleKey: string }
> = {
  success: {
    color: '#32c682',
    icon: IconCircleCheck,
    titleKey: 'errors:notification.success',
  },
  error: {
    color: '#ff5549',
    icon: IconCircleX,
    titleKey: 'errors:notification.error',
  },
  warning: {
    color: '#eebf31',
    icon: IconAlertTriangle,
    titleKey: 'errors:notification.warning',
  },
  info: {
    color: '#26c0d3',
    icon: IconInfoCircle,
    titleKey: 'common:notiflix.info',
  },
};

function openReport(type: ReportType, message: string, callback?: () => void) {
  const config = reportConfig[type];
  const Icon = config.icon;

  modals.open({
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
    size: 400,
    children: (
      <Stack align="center" gap="md" py="sm">
        <ThemeIcon size={64} variant="transparent" color={config.color}>
          <Icon size={64} stroke={1.5} />
        </ThemeIcon>
        <Text fw={600} size="lg">
          {t(config.titleKey)}
        </Text>
        <Text
          c="gray.7"
          ta="center"
          size="sm"
          dangerouslySetInnerHTML={{ __html: boldQuoted(message, config.color) }}
        />
        <Button
          color={config.color}
          fullWidth
          mt="xs"
          onClick={() => {
            modals.closeAll();
            callback?.();
          }}
        >
          {t('common:notiflix.ok')}
        </Button>
      </Stack>
    ),
  });
}

export const Report = {
  success: (message: string, callback?: () => void) =>
    openReport('success', message, callback),
  error: (message: string, callback?: () => void) =>
    openReport('error', message, callback),
  warning: (message: string, callback?: () => void) =>
    openReport('warning', message, callback),
  info: (message: string, callback?: () => void) =>
    openReport('info', message, callback),
};

export function handleError(error: unknown): void {
  const { mode, message, onConfirm } = handleErrorMode(error);

  if (mode === 'error') {
    Report.error(message, onConfirm);
  } else {
    Report.warning(message);
  }
}

interface ConfirmShowOptions {
  message: string;
  title?: string;
  note?: string;
}

export const Confirm = {
  show: (options: ConfirmShowOptions | string, title?: string): Promise<boolean> => {
    const opts = typeof options === 'string'
      ? { message: options, title }
      : options;

    return new Promise((resolve) => {
      modals.open({
        withCloseButton: false,
        closeOnClickOutside: false,
        closeOnEscape: false,
        size: 400,
        children: (
          <Stack align="center" gap="md" py="sm">
            <ThemeIcon size={64} variant="transparent" color="#1c7ed6">
              <IconInfoCircle size={64} stroke={1.5} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              {opts.title || t('common:confirm.confirm')}
            </Text>
            <Text
              c="gray.7"
              ta="center"
              size="sm"
              dangerouslySetInnerHTML={{ __html: boldQuoted(opts.message, '#1c7ed6') }}
            />
            {opts.note && (
              <Alert
                variant="light"
                color="orange"
                icon={<IconAlertTriangle size={18} />}
                w="100%"
                py="xs"
              >
                <Text size="xs">{opts.note}</Text>
              </Alert>
            )}
            <Group w="100%" grow mt="xs">
              <Button
                variant="default"
                onClick={() => {
                  modals.closeAll();
                  resolve(false);
                }}
              >
                {t('common:button.cancel')}
              </Button>
              <Button
                color="blue"
                onClick={() => {
                  modals.closeAll();
                  resolve(true);
                }}
              >
                {t('common:button.confirm')}
              </Button>
            </Group>
          </Stack>
        ),
      });
    });
  },
};
