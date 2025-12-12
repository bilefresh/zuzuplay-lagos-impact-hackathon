import { useMutation, useQueryClient } from 'react-query'

export interface FormDataType {
  email?: string
  password?: string
  parentName?: string
  childName?: string
  childClass?: string
}

const useFormData = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (newData: Partial<FormDataType>) => {
      const existingData =
        queryClient.getQueryData<FormDataType>(['formData']) || {}

      // Return the merged data as a resolved Promise
      return Promise.resolve({ ...existingData, ...newData })
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['formData'], data)
      },
    }
  )
}

export default useFormData
