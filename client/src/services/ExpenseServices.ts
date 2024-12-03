import { apiClient } from "./utils/AxiosInterceptor"


export const CreateOrEditExpenseCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`checklists/categories/${id}`, body)
    }
    return await apiClient.post(`checklists/categories`, body)
}
export const DeleteExpenseCategory = async (id: string) => {
    return await apiClient.delete(`checklists/categories/${id}`)
}



export const CreateOrEditExpenseLocation = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`checklists/categories/${id}`, body)
    }
    return await apiClient.post(`checklists/categories`, body)
}
export const DeleteExpenseLocation = async (id: string) => {
    return await apiClient.delete(`checklists/categories/${id}`)
}



export const CreateOrEditItemUnit = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`checklists/categories/${id}`, body)
    }
    return await apiClient.post(`checklists/categories`, body)
}
export const DeleteItemUnit = async (id: string) => {
    return await apiClient.delete(`checklists/categories/${id}`)
}