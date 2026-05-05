import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type BrandPayload = {
  name: string
}

export const useBrandActions = () => {
  const queryClient = useQueryClient()

  const invalidateBrands = () => {
    queryClient.invalidateQueries({ queryKey: ['brands'] })
  }

  const createBrand = useMutation({
    mutationFn: (payload: BrandPayload) =>
      API.post(API_ENDPOINTS.BRAND.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidateBrands()
      toast('Brand created successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to create brand', 'error')
        return
      }
      toast('Failed to create brand', 'error')
    },
  })

  const updateBrand = useMutation({
    mutationFn: ({ brandId, payload }: { brandId: string; payload: BrandPayload }) =>
      API.patch(`${API_ENDPOINTS.BRAND.UPDATE}/${brandId}`, payload).then(
        (res) => res.data?.data ?? res.data,
      ),

    onSuccess: () => {
      invalidateBrands()
      toast('Brand updated successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to update brand', 'error')
        return
      }
      toast('Failed to update brand', 'error')
    },
  })

  const deleteBrand = useMutation({
    mutationFn: (brandId: string) =>
      API.delete(`${API_ENDPOINTS.BRAND.DELETE}/${brandId}`).then((res) => res.data),

    onSuccess: () => {
      invalidateBrands()
      toast('Brand deleted successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to delete brand', 'error')
        return
      }
      toast('Failed to delete brand', 'error')
    },
  })

  return {
    createBrand,
    updateBrand,
    deleteBrand,
  }
}
