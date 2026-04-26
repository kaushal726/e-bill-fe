import { useQuery } from '@tanstack/react-query'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'

export type StaffRecord = {
  _id: string
  name: string
  mobileNumber: string
  role: string
  baseSalary: number
  salaryPerWeek: number
  sundayPolicy: 'regular' | 'paid_off' | 'halfday_paid_full'
  joinDate: string
  isActive: boolean
  createdAt?: string
}

export type StaffPaginatedResponse = {
  staff: StaffRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalStaff: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const EMPTY_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalStaff: 0,
  limit: 20,
  hasNextPage: false,
  hasPrevPage: false,
}

export const getStaffList = async (page = 1, limit = 20): Promise<StaffPaginatedResponse> => {
  const res = await API.get(API_ENDPOINTS.STAFF.BASE, { params: { page, limit } })
  return res?.data?.data || { staff: [], pagination: { ...EMPTY_PAGINATION, limit } }
}

export const getAllStaff = async (): Promise<StaffRecord[]> => {
  const res = await API.get(API_ENDPOINTS.STAFF.BASE, { params: { page: 1, limit: 100 } })
  return res?.data?.data?.staff ?? []
}

export const useStaff = (page = 1) => {
  return useQuery({
    queryKey: ['getStaffList', page],
    queryFn: () => getStaffList(page),
  })
}

export const useAllStaff = () => {
  return useQuery({
    queryKey: ['allStaff'],
    queryFn: getAllStaff,
  })
}
