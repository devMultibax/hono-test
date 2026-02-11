import { createTheme, MantineProvider } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

const primaryColor: MantineColorsTuple = [
  '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7',
  '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'
];

const theme = createTheme({
  fontFamily: 'K2D, sans-serif',
  primaryColor: 'primary',
  colors: {
    primary: primaryColor,
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
        searchable: true,
        clearable: true,
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}
