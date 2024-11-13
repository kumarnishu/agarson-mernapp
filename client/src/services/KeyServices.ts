import { apiClient } from "./utils/AxiosInterceptor";


export const GetAllKeys = async () => {
    return await apiClient.get(`keys`)
}

export const CreateOrEditKey = async ({ body, id }: {
    body: {
        key: string,
        category: string,
        type: string
     }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`keys/${id}`, body)
    }
    return await apiClient.post(`keys`, body)
}
export const DeleteKey = async (id: string) => {
    return await apiClient.delete(`keys/${id}`)
}



export const GetAllKeyCategories = async () => {
    return await apiClient.get(`key-category`)
}

export const CreateOrEditKeyCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`key-category/${id}`, body)
    }
    return await apiClient.post(`key-category`, body)
}
export const DeleteKeyCategory = async (id: string) => {
    return await apiClient.delete(`key-category/${id}`)
}

export const AssignKeyCategoryToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        categoryids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`key-category/assign`, body)
}
export const AssignKeysToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        key_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`keys/assign`, body)
}