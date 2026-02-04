import { Button, Container, Title, Stack, TextInput } from '@mantine/core'

function App() {
  return (
    <Container className="py-10">
      <Stack gap="md">
        {/* Mantine Component */}
        <Title order={1}>Hello Mantine + Tailwind</Title>
        
        {/* Tailwind Classes บน Mantine Component */}
        <Title order={2} className="text-blue-600">
          Styled with Tailwind
        </Title>
        
        {/* Mantine Form Components */}
        <TextInput
          label="Email"
          placeholder="your@email.com"
          className="max-w-sm"
        />
        
        {/* Mantine Button */}
        <Button className="w-fit">
          Mantine Button
        </Button>
        
        {/* Pure Tailwind */}
        <p className="text-gray-500 text-sm">
          This is styled with Tailwind CSS only
        </p>
      </Stack>
    </Container>
  )
}

export default App