import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type SupplierPayload = {
  name: string
  mobileNumber: string
  address?: string
  gstNumber?: string
  bankName?: string
  accountHolderName?: string
  bankAccountNumber?: string
  ifscCode?: string
  pendingAmount?: number
  totalPurchaseAmount?: number
}

export const useSupplierActions = () => {
  const queryClient = useQueryClient()

  const invalidateSuppliers = () => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  }

  const createSupplier = useMutation({
    mutationFn: (payload: SupplierPayload) =>
      API.post(API_ENDPOINTS.SUPPLIERS.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidateSuppliers()
      toast('Supplier created successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to create supplier', 'error')
        return
      }

      toast('Failed to create supplier', 'error')
    },
  })

  const updateSupplier = useMutation({
    mutationFn: ({ supplierId, payload }: { supplierId: string; payload: SupplierPayload }) =>
      API.patch(`${API_ENDPOINTS.SUPPLIERS.UPDATE}/${supplierId}`, payload).then(
        (res) => res.data?.data ?? res.data,
      ),

    onSuccess: () => {
      invalidateSuppliers()
      toast('Supplier updated successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to update supplier', 'error')
        return
      }

      toast('Failed to update supplier', 'error')
    },
  })

  const deleteSupplier = useMutation({
    mutationFn: (supplierId: string) =>
      API.delete(`${API_ENDPOINTS.SUPPLIERS.DELETE}/${supplierId}`).then((res) => res.data),

    onSuccess: () => {
      invalidateSuppliers()
      toast('Supplier deleted successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to delete supplier', 'error')
        return
      }

      toast('Failed to delete supplier', 'error')
    },
  })

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}
