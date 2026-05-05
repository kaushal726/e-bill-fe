import { API } from '@/api/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'

const toast = ToasterUtil()

export const useBrandExport = () => {
  return useMutation({
    mutationFn: async (params?: Record<string, any>) => {
      const res = await API.get(API_ENDPOINTS.BRAND.EXPORT, {
        params,
        responseType: 'blob',
      })
      return res.data
    },

    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brands-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },

    onError: () => {
      toast('Brand export failed', 'error')
    },
  })
}
