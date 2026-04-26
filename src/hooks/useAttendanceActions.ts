import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'

const toast = ToasterUtil()

export type MarkAttendancePayload = {
  staffId: string
  status: 'present' | 'halfday' | 'absent' | 'leave'
  date?: string
  checkIn?: string
  checkOut?: string
}

export type BulkMarkPayload = {
  date?: string
  records: { staffId: string; status: 'present' | 'halfday' | 'absent' | 'leave' }[]
}

export const useAttendanceActions = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
  }

  const markAttendance = useMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      API.post(API_ENDPOINTS.ATTENDANCE.MARK, payload).then((r) => r.data),
    onSuccess: () => {
      invalidate()
      toast('Attendance marked', 'success')
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Failed to mark attendance', 'error')
    },
  })

  const bulkMarkAttendance = useMutation({
    mutationFn: (payload: BulkMarkPayload) =>
      API.post(API_ENDPOINTS.ATTENDANCE.MARK_BULK, payload).then((r) => r.data),
    onSuccess: (res) => {
      invalidate()
      const saved = res?.data?.saved ?? 0
      toast(`Bulk mark complete: ${saved} saved`, 'success')
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Bulk mark failed', 'error')
    },
  })

  return { markAttendance, bulkMarkAttendance }
}
