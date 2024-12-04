import { apiClient } from "./utils/AxiosInterceptor"


export const CreateOrEditExpenseCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`expense/categories/${id}`, body)
    }
    return await apiClient.post(`expense/categories`, body)
}
export const DeleteExpenseCategory = async (id: string) => {
    return await apiClient.delete(`expense/categories/${id}`)
}



export const CreateOrEditExpenseLocation = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`expense/locations/${id}`, body)
    }
    return await apiClient.post(`expense/locations`, body)
}
export const DeleteExpenseLocation = async (id: string) => {
    return await apiClient.delete(`expense/locations/${id}`)
}


export const CreateOrEditItemUnit = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`item/unit/${id}`, body)
    }
    return await apiClient.post(`item/unit`, body)
}
export const DeleteItemUnit = async (id: string) => {
    return await apiClient.delete(`item/unit/${id}`)
}