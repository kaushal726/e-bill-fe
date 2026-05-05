import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, useMediaQuery, Box, Text } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useStaffActions } from '@/hooks/useStaffActions'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'

/* ---------------- TYPES ---------------- */

export interface StaffFormValues {
  name: string
  mobileNumber: string
  role: string
  baseSalary: string
  salaryPerWeek: string
  sundayPolicy: 'regular' | 'paid_off' | 'halfday_paid_full'
  joinDate: string
}

interface StaffDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  pubId?: string
  defaultValues?: StaffFormValues
}

const getTodayDate = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

/* ---------------- COMPONENT ---------------- */

export default function StaffDialog({
  open,
  onClose,
  mode,
  pubId,
  defaultValues,
}: StaffDialogProps) {
  const [formData, setFormData] = useState<StaffFormValues>({
    name: '',
    mobileNumber: '',
    role: '',
    baseSalary: '',
    salaryPerWeek: '',
    sundayPolicy: 'regular',
    joinDate: '',
  })

  const { createStaff, updateStaff } = useStaffActions(pubId ?? '')

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues)
    } else {
      setFormData({
        name: '',
        mobileNumber: '',
        role: '',
        baseSalary: '',
        salaryPerWeek: '',
        sundayPolicy: 'regular',
        joinDate: getTodayDate(),
      })
    }
  }, [defaultValues, mode])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    const payload = {
      name: formData.name,
      mobileNumber: formData.mobileNumber,
      role: formData.role,
      baseSalary: Number(formData.baseSalary),
      salaryPerWeek: Number(formData.salaryPerWeek),
      sundayPolicy: formData.sundayPolicy,
      joinDate: formData.joinDate,
    }

    if (mode === 'add') {
      createStaff.mutate(payload, { onSuccess: onClose })
      return
    }

    updateStaff.mutate(payload, { onSuccess: onClose })
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      preventScroll
      size={isLarge ? 'lg' : 'full'}
      placement={isLarge ? 'center' : 'bottom'}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" rounded="lg" shadow="lg" p={4} width="100%" maxW="600px">
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="2xl" fontWeight="700" color="gray.800">
                {mode === 'add' ? 'Add New Staff' : 'Edit Staff'}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Field.Root mb={3}>
                <Field.Label>Full Name</Field.Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Phone Number</Field.Label>
                <Input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Role</Field.Label>
                <Input name="role" value={formData.role} onChange={handleChange} />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Base Salary</Field.Label>
                <Input
                  name="baseSalary"
                  type="number"
                  value={formData.baseSalary}
                  onChange={handleChange}
                />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Salary Per Week</Field.Label>
                <Input
                  name="salaryPerWeek"
                  type="number"
                  value={formData.salaryPerWeek}
                  onChange={handleChange}
                />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Sunday Salary Rule</Field.Label>
                <Box
                  as="select"
                  name="sundayPolicy"
                  value={formData.sundayPolicy}
                  onChange={handleChange}
                  width="100%"
                  height="40px"
                  px={3}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="white"
                >
                  <option value="regular">Regular day rules</option>
                  <option value="paid_off">Sunday off with full pay</option>
                  <option value="halfday_paid_full">Sunday half day counts as full pay</option>
                </Box>
              </Field.Root>

              <Text fontSize="sm" color="gray.600" mb={3}>
                Choose how Sunday salary should be handled for this staff member.
              </Text>

              <Field.Root>
                <Field.Label>Join Date</Field.Label>
                <DateInputWithIcon
                  name="joinDate"
                  value={formData.joinDate || getTodayDate()}
                  onChange={(value) => setFormData((prev) => ({ ...prev, joinDate: value }))}
                />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button
                  minW="120px"
                  width="50%"
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button
                minW="160px"
                bg="#6730EC"
                color="white"
                width="50%"
                loading={createStaff.isPending || updateStaff.isPending}
                onClick={handleSubmit}
              >
                {mode === 'add' ? 'Add Staff' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
