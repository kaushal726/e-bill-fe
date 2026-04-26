import { Dialog, Card, Button, HStack, Text, Box } from '@chakra-ui/react'

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'number' | 'password' | 'select'
  options?: string[]
  required?: boolean
  defaultValue?: string | number
}

interface AdaptiveModalProps {
  isOpen: boolean
  title?: string
  fields: FieldConfig[]
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
}

export default function AdaptiveModal({
  isOpen,
  title = 'Form',
  fields,
  onClose,
  onSubmit,
}: AdaptiveModalProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const values: Record<string, any> = {}

    fields.forEach((f) => {
      const val = fd.get(f.name)

      if (f.type === 'number') values[f.name] = Number(val)
      else values[f.name] = val
    })

    onSubmit(values)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Backdrop
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <Dialog.Content
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        rounded="lg"
        shadow="lg"
        // â¬‡ Responsive width
        width={{ base: '95%', md: '90%', lg: '900px' }}
        maxW="95%"
        // â¬‡ Increased height
        maxH={{ base: '80vh', md: '85vh', lg: '90vh' }}
        overflow="hidden"
      >
        <Card.Root borderRadius="lg">
          {/* HEADER */}
          <Card.Header
            p={5}
            borderBottom="1px solid #e5e7eb"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="2xl" fontWeight="semibold">
              {title}
            </Text>

            <HStack gap={2}>
              <Button size="sm" variant="subtle">
                Add Custom Field
              </Button>

              <Button size="sm" variant="subtle">
                Bulk Upload
              </Button>

              <Button size="sm" variant="ghost" onClick={onClose}>
                âœ•
              </Button>
            </HStack>
          </Card.Header>

          {/* BODY */}
          <form onSubmit={handleSubmit}>
            <Card.Body
              p={5}
              overflowY="auto"
              // â¬‡ Increased scrollable area
              maxH={{ base: '55vh', md: '60vh', lg: '70vh' }}
              display="grid"
              // â¬‡ Responsive grid (2 columns on mobile, 3 on medium+)
              gridTemplateColumns={{
                base: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(auto-fill, minmax(260px, 1fr))',
              }}
              gap={5}
            >
              {fields.map((field) => (
                <Box key={field.name} display="flex" flexDirection="column">
                  <label htmlFor={`field-${field.name}`}>{field.label}</label>

                  {field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      name={field.name}
                      defaultValue={field.defaultValue as string}
                      required={field.required}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                      }}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      defaultValue={field.defaultValue as string}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Card.Body>

            {/* FOOTER */}
            <Card.Footer
              p={5}
              borderTop="1px solid #e5e7eb"
              display="flex"
              justifyContent="flex-end"
              gap={3}
            >
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button colorPalette="blue" type="submit">
                Add
              </Button>
            </Card.Footer>
          </form>
        </Card.Root>
      </Dialog.Content>
    </Dialog.Root>
  )
}
