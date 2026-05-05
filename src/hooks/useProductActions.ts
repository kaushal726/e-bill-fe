import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type ProductPayload = {
  name: string
  brandId?: string
  newBrandName?: string
  categoryId?: string
  newCategoryName?: string
  supplierId?: string
  purchasePrice: number
  sellingPrice: number
  unit?: string
  stock?: number
  gstPercentage?: number
  gstInclusive?: boolean
  discountType?: 'percentage' | 'absolute'
  discountValue?: number
  minimumStock?: number
  size?: string
  color?: string
  material?: string
}

export const useProductActions = () => {
  const queryClient = useQueryClient()

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createProduct = useMutation({
    mutationFn: (payload: ProductPayload) =>
      API.post(API_ENDPOINTS.PRODUCTS.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidateProducts()
      toast('Product created successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to create product', 'error')
        return
      }

      toast('Failed to create product', 'error')
    },
  })

  const updateProduct = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: ProductPayload }) =>
      API.patch(`${API_ENDPOINTS.PRODUCTS.UPDATE}/${productId}`, payload).then(
        (res) => res.data?.data ?? res.data,
      ),

    onSuccess: () => {
      invalidateProducts()
      toast('Product updated successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to update product', 'error')
        return
      }

      toast('Failed to update product', 'error')
    },
  })

  const deleteProduct = useMutation({
    mutationFn: (productId: string) =>
      API.delete(`${API_ENDPOINTS.PRODUCTS.DELETE}/${productId}`).then((res) => res.data),

    onSuccess: () => {
      invalidateProducts()
      toast('Product deleted successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to delete product', 'error')
        return
      }

      toast('Failed to delete product', 'error')
    },
  })

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
