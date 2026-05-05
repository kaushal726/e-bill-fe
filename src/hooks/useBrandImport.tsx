import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'

const toast = ToasterUtil()

export const useBrandImport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await API.post(API_ENDPOINTS.BRAND.IMPORT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast(response?.message || 'Brands imported successfully', 'success')
    },

    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Brand import failed', 'error')
    },
  })
}
