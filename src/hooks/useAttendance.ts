import { useQuery } from '@tanstack/react-query'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'

export type AttendanceStatus = 'present' | 'halfday' | 'absent' | 'leave'

export type AttendanceRecord = {
  _id: string
  staffId: {
    _id: string
    name: string
    mobileNumber: string
    role: string
    salaryPerWeek: number
    baseSalary: number
    sundayPolicy?: 'regular' | 'paid_off' | 'halfday_paid_full'
  }
  date: string
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
}

export type WeeklySummaryEntry = {
  staffId: string
  name: string
  mobileNumber: string
  role: string
  sundayPolicy: 'regular' | 'paid_off' | 'halfday_paid_full'
  weeklyRate: number
  monthlyRate?: number
  perDayRate: number
  attendance: { present: number; halfday: number; absent: number; leave: number }
  paidSundayDays: number
  payableDays: number
  payableAmount: number
}

export type WeeklySummary = {
  weekStart: string
  weekEnd: string
  totals: {
    staffCount: number
    totalWeeklyRate: number
    totalPayable: number
    totalPresentDays: number
    totalHalfDays: number
    totalPaidSundayDays: number
    totalAbsentDays: number
    totalLeaveDays: number
  }
  summary: WeeklySummaryEntry[]
}

export type MonthlySummaryEntry = {
  staffId: string
  name: string
  mobileNumber: string
  role: string
  sundayPolicy: 'regular' | 'paid_off' | 'halfday_paid_full'
  weeklyRate: number
  monthlyRate: number
  perDayRate: number
  attendance: { present: number; halfday: number; absent: number; leave: number }
  paidSundayDays: number
  daysInMonth: number
  payableDays: number
  payableAmount: number
}

export type MonthlySummary = {
  month: string
  monthStart: string
  monthEnd: string
  totals: {
    staffCount: number
    totalMonthlyRate: number
    totalPayable: number
    totalPresentDays: number
    totalHalfDays: number
    totalPaidSundayDays: number
    totalAbsentDays: number
    totalLeaveDays: number
  }
  summary: MonthlySummaryEntry[]
}

export const useAttendanceByDate = (date: string) =>
  useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', 'date', date],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.ATTENDANCE.DATE, { params: { date } })
      return res?.data?.data ?? []
    },
    enabled: !!date,
  })

export const useWeeklySalarySummary = (weekStart?: string) =>
  useQuery<WeeklySummary | null>({
    queryKey: ['attendance', 'weekly', weekStart ?? 'current'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.ATTENDANCE.WEEKLY_SALARY, {
        params: weekStart ? { weekStart } : {},
      })
      return res?.data?.data ?? null
    },
  })

export const useMonthlySalarySummary = (month?: string) =>
  useQuery<MonthlySummary | null>({
    queryKey: ['attendance', 'monthly', month ?? 'current'],
    queryFn: async () => {
      const res = await API.get(API_ENDPOINTS.ATTENDANCE.MONTHLY_SALARY, {
        params: month ? { month } : {},
      })
      return res?.data?.data ?? null
    },
  })
