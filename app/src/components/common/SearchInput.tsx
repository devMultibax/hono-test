import { useState, useEffect } from 'react';
import { TextInput, CloseButton } from '@mantine/core';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from '@/lib/i18n';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  debounce?: number;
}

export function SearchInput({ value, onChange, placeholder, label, debounce = 400 }: Props) {
  const { t } = useTranslation('common');
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue] = useDebouncedValue(localValue, debounce);

  // Sync external value
  useEffect(() => setLocalValue(value), [value]);

  // Emit debounced changes
  useEffect(() => {
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <TextInput
      label={label}
      placeholder={placeholder || t('placeholder.search')}
      leftSection={<Search size={16} />}
      rightSection={localValue && <CloseButton size="sm" onClick={() => setLocalValue('')} />}
      value={localValue}
      onChange={(e) => setLocalValue(e.currentTarget.value)}
    />
  );
}
