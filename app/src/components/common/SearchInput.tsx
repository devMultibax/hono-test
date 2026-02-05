import { useState, useEffect } from 'react';
import { TextInput, CloseButton } from '@mantine/core';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@mantine/hooks';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'ค้นหา...',
  debounce = 400
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue] = useDebouncedValue(localValue, debounce);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, value]);

  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<Search size={16} />}
      rightSection={
        localValue && (
          <CloseButton
            size="sm"
            onClick={() => {
              setLocalValue('');
              onChange('');
            }}
          />
        )
      }
      value={localValue}
      onChange={(e) => setLocalValue(e.currentTarget.value)}
    />
  );
}
