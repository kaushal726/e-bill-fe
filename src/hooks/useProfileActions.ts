import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type BankAccount = {
  bankName: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  upiId?: string
}

export type UpdateProfilePayload = {
  firstName?: string
  lastName?: string
  mobileNumber?: string
  shopName?: string
  gstin?: string
  address?: string
  pincode?: string
  bankAccounts?: BankAccount[]
}

export const useProfileActions = () => {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      API.put(API_ENDPOINTS.AUTH.EDIT, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['getProfile'], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['getProfile'] })
    },
  })

  return {
    updateProfile,
  }
}
